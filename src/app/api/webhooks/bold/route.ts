import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/app/actions/checkout";
import { sendOrderConfirmationEmail } from "@/services/email/client";

// ---------------------------------------------------------------------------
// Verificación HMAC-SHA256 — timing-safe
//
// DOCUMENTACIÓN OFICIAL BOLD (Payment Intent API — Producción):
//   Base URL: https://api.online.payments.bold.co
//   1. Convertir el rawBody a Base64
//   2. Calcular HMAC-SHA256 sobre ese Base64 usando el secreto
//   3. Comparar en hex con timing-safe
//
// BOLD_WEBHOOK_SECRET = secreto HMAC configurado en el Dashboard de Bold (Webhooks → Secreto)
// Header enviado por Bold: "x-bold-signature" (NO "bold-signature")
// ---------------------------------------------------------------------------
function verifyBoldSignature(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.BOLD_WEBHOOK_SECRET;

  // undefined/null = variable no configurada → rechazar siempre
  if (secret === undefined || secret === null) {
    console.error("[Bold] ✗ BOLD_WEBHOOK_SECRET no está configurado en .env.local");
    console.error("[Bold]   Copia el secreto desde: Dashboard Bold → Webhooks → Secreto (producción)");
    return false;
  }

  if (!signatureHeader) {
    console.warn("[Bold] ✗ Header 'x-bold-signature' ausente en la petición");
    return false;
  }

  // Bold puede enviar la firma con prefijo "sha256=" (convención HMAC estándar)
  const rawSignature = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice(7)
    : signatureHeader;

  // CRÍTICO: Bold requiere HMAC sobre el body en Base64, NO sobre el raw body directamente
  const bodyBase64 = Buffer.from(rawBody).toString("base64");
  const expected = createHmac("sha256", secret).update(bodyBase64).digest("hex");

  try {
    const expectedBuf = Buffer.from(expected, "hex");
    const receivedBuf = Buffer.from(rawSignature, "hex");

    // timingSafeEqual lanza RangeError si los buffers difieren en longitud
    if (expectedBuf.length !== receivedBuf.length) return false;

    return timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Bold Webhook Handler — Next.js App Router
// Bold Payment Intent API — Producción: https://api.online.payments.bold.co
//
// ORDEN DE OPERACIONES:
//   1. Capturar rawBody + headers   ← HMAC necesita el string sin parsear
//   2. Parsear JSON                  ← extraer campos del payload
//   3. Responder HTTP 200 INMEDIATAMENTE (Bold cancela si no responde en < 2s)
//   4. DESPUÉS del 200 (via after()):
//      a. CREAR LOG EN BD            ← auditoría antes de cualquier validación
//      b. Validar firma HMAC-SHA256  ← seguridad
//      c. Procesar pago              ← negocio
//
// Eventos Bold (Payment Intent API):
//   SALE_APPROVED        → pago exitoso  ✅
//   SALE_REJECTED        → pago rechazado
//   VOID_APPROVED        → anulación aprobada (mismo día, antes 9 PM)
//   VOID_REJECTED        → anulación rechazada
//   PAYMENT_APPROVED     → alias de SALE_APPROVED en algunos entornos
//   PAYMENT_REJECTED     → alias de SALE_REJECTED en algunos entornos
//
// Campos clave en el payload de producción:
//   data.transaction_id  → ID único de la transacción Bold
//   data.reference_id    → nuestro reference (transactionId de la orden)
//   data.status          → APPROVED | REJECTED | RUNNING | CANCELLED
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  // ── Step 1: Capturar rawBody y headers SÍNCRONAMENTE ───────────────────────
  console.log('[BOLD WEBHOOK] Solicitud recibida:', new Date().toISOString());

  const signatureHeader = req.headers.get("x-bold-signature") ?? "";
  console.log("[BOLD WEBHOOK] x-bold-signature:", signatureHeader || "(ausente)");

  let rawBody: string;
  try {
    rawBody = await req.text();
    console.log("[BOLD WEBHOOK] Body raw recibido:", rawBody.slice(0, 500));
  } catch (err) {
    console.error("[BOLD WEBHOOK] ✗ No se pudo leer el body:", err);
    return NextResponse.json({ error: "Cannot read body" }, { status: 400 });
  }

  // ── Step 2: Parsear JSON ───────────────────────────────────────────────────
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error("[BOLD WEBHOOK] ✗ JSON inválido. Body recibido:", rawBody.slice(0, 500));

    // Guardar log en background incluso para payloads malformados
    after(async () => {
      await prisma.webhookLog
        .create({
          data: {
            provider: "BOLD",
            eventType: "parse_error",
            payload: { raw: rawBody.slice(0, 2000) },
            signature: signatureHeader,
            status: 400,
            errorMessage: "JSON inválido recibido de Bold",
          },
        })
        .catch((e) => console.error("[BOLD WEBHOOK] ✗ No se pudo registrar error de parse:", e));
    });

    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ── Step 3: Extraer campos del payload ────────────────────────────────────
  //
  // Bold Payment Intent API envía estructura anidada:
  //   {
  //     type: "SALE_APPROVED",
  //     data: {
  //       transaction_id: "TXN...",      ← ID único de la transacción
  //       reference_id: "CV-xxx",        ← nuestro reference (transactionId de la orden)
  //       status: "APPROVED",
  //       amount: { total_amount: ... },
  //       payment_method: "CREDIT_CARD",
  //       ...
  //     }
  //   }
  //
  const data = (payload.data ?? payload) as Record<string, unknown>;
  const eventType = (payload.type ?? payload.event ?? data.event) as string | undefined;

  // transaction_id es el ID de Bold (nuevo API); fallback a payment_id / id para compatibilidad
  const boldPaymentId = (
    data.transaction_id ?? data.payment_id ?? data.id ?? payload.id
  ) as string | undefined;

  // reference_id es nuestro identificador de orden (nuevo API); fallback a metadata.reference
  const metadata = (data.metadata ?? payload.metadata) as Record<string, unknown> | undefined;
  const reference = (
    data.reference_id ?? metadata?.reference ?? data.reference ?? payload.reference
  ) as string | undefined;

  const boldStatus = (data.status ?? payload.status) as string | undefined;
  const amount = (
    (data.amount as Record<string, unknown>)?.total_amount ??
    (data.amount as Record<string, unknown>)?.total ??
    (payload.amount as Record<string, unknown>)?.total_amount ??
    (payload.amount as Record<string, unknown>)?.total
  ) as number | undefined;
  const paymentMethod = (data.payment_method ?? payload.payment_method) as string | undefined;

  console.log("[BOLD WEBHOOK] Evento:", eventType, "| Referencia:", reference, "| Estado:", boldStatus);

  // ── Step 4: Responder 200 INMEDIATAMENTE (Bold requiere < 2 segundos) ─────
  //
  // TODO el procesamiento real va dentro de after() — se ejecuta DESPUÉS de
  // retornar esta respuesta, sin bloquear a Bold.
  after(async () => {
    await processWebhookAsync({
      rawBody,
      payload,
      signatureHeader,
      eventType,
      boldPaymentId,
      reference,
      boldStatus,
      amount,
      paymentMethod,
    });
  });

  return NextResponse.json({ received: true }, { status: 200 });
}

// ---------------------------------------------------------------------------
// processWebhookAsync — lógica completa en background (después del 200)
// ---------------------------------------------------------------------------
interface WebhookFields {
  rawBody: string;
  payload: Record<string, unknown>;
  signatureHeader: string;
  eventType: string | undefined;
  boldPaymentId: string | undefined;
  reference: string | undefined;
  boldStatus: string | undefined;
  amount: number | undefined;
  paymentMethod: string | undefined;
}

async function processWebhookAsync(fields: WebhookFields): Promise<void> {
  const {
    rawBody,
    payload,
    signatureHeader,
    eventType,
    boldPaymentId,
    reference,
    boldStatus,
    amount,
    paymentMethod,
  } = fields;

  // ── a. Crear log inmediato (antes de validar firma) ─────────────────────
  //
  // Esto garantiza que CUALQUIER petición quede en webhook_logs,
  // incluso si la firma es inválida o el secreto no está configurado.
  // Si los logs están vacíos, Bold no está llegando al servidor (URL mal configurada).
  let logEntry: { id: string } | undefined;
  try {
    const order = reference
      ? await prisma.order.findUnique({ where: { transactionId: reference }, select: { id: true } })
      : null;

    if (reference && !order) {
      console.warn("[BOLD WEBHOOK] ⚠ No se encontró orden con transactionId:", reference);
    }

    logEntry = await prisma.webhookLog.create({
      data: {
        orderId: order?.id ?? null,
        provider: "BOLD",
        eventType: eventType ?? null,
        payload: payload as any,
        signature: signatureHeader,
        status: 0, // Se actualiza al final (0 = en proceso)
        attempt: 1,
      },
    });
    console.log("[BOLD WEBHOOK] ✓ Log creado:", logEntry.id);
  } catch (logErr) {
    console.error("[BOLD WEBHOOK] ✗ Error al crear log:", logErr);
    // Continuar — el negocio es más importante que la auditoría
  }

  const updateLog = (status: number, errorMessage?: string) => {
    if (!logEntry) return;
    prisma.webhookLog
      .update({ where: { id: logEntry!.id }, data: { status, errorMessage: errorMessage ?? null } })
      .catch((e) => console.error("[BOLD WEBHOOK] ✗ Error actualizando log:", e));
  };

  // ── b. Validar firma HMAC-SHA256 ─────────────────────────────────────────
  const signatureValid = verifyBoldSignature(rawBody, signatureHeader);

  if (!signatureValid) {
    console.warn("[BOLD WEBHOOK] ✗ Firma HMAC inválida.");
    console.warn("[BOLD WEBHOOK] Posibles causas:");
    console.warn("  1. BOLD_WEBHOOK_SECRET incorrecto — usa el secreto de PRODUCCIÓN del Dashboard Bold");
    console.warn("  2. Copia el secreto exacto desde: Dashboard Bold → Webhooks → Secreto");
    console.warn("  3. El body fue modificado por un middleware antes de llegar aquí");
    updateLog(401, "Firma HMAC-SHA256 inválida");
    return;
  }

  console.log("[BOLD WEBHOOK] ✓ Firma HMAC válida");

  // ── c. Procesar evento ───────────────────────────────────────────────────
  //
  // Estados Bold (Payment Intent API — GET /v1/payment/{reference_id}):
  //   RUNNING     → Pago en proceso (3DS pendiente, etc.)
  //   APPROVED    → Pago exitoso ✅
  //   REJECTED    → Pago rechazado
  //   CANCELLED   → Cancelado por usuario
  //
  // Eventos Bold (webhook — Payment Intent API):
  //   SALE_APPROVED   → pago exitoso ✅
  //   SALE_REJECTED   → pago rechazado
  //   VOID_APPROVED   → anulación aprobada (mismo día)
  //   VOID_REJECTED   → anulación rechazada

  const isApproved =
    eventType === "SALE_APPROVED" ||
    eventType === "PAYMENT_APPROVED" ||
    eventType === "TRANSACTION_APPROVED" ||
    eventType === "payment.approved" ||
    boldStatus === "APPROVED" ||
    boldStatus === "approved" ||
    boldStatus === "PAID";

  const isRejected =
    eventType === "SALE_REJECTED" ||
    eventType === "PAYMENT_REJECTED" ||
    eventType === "payment.rejected" ||
    boldStatus === "REJECTED" ||
    boldStatus === "rejected";

  const isRefunded =
    eventType === "VOID_APPROVED" ||
    boldStatus === "REFUNDED" ||
    boldStatus === "refunded";

  if (!isApproved && !isRejected && !isRefunded) {
    console.log("[BOLD WEBHOOK] ℹ Evento recibido pero no requiere acción:", { eventType, boldStatus });
    updateLog(200);
    return;
  }

  if (isRejected || isRefunded) {
    const newStatus = isRefunded ? "REFUNDED" : "FAILED";
    console.log(`[BOLD WEBHOOK] ℹ Evento ${eventType ?? boldStatus} → actualizando orden a ${newStatus}`);

    if (reference) {
      try {
        await prisma.order.update({
          where: { transactionId: reference },
          data: { status: newStatus as any },
        });
        console.log(`[BOLD WEBHOOK] ✓ Orden actualizada a ${newStatus}. transactionId:`, reference);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        console.error(`[BOLD WEBHOOK] ✗ Error al actualizar orden a ${newStatus}:`, msg);
        updateLog(500, msg);
        return;
      }
    }

    updateLog(200);
    return;
  }

  // isApproved
  if (!reference || !boldPaymentId) {
    const msg = `Faltan campos requeridos: reference=${reference}, boldPaymentId=${boldPaymentId}`;
    console.error("[BOLD WEBHOOK] ✗", msg);
    // Devolver 200 para que Bold no reintente — es problema de datos, no del servidor
    updateLog(200, msg);
    return;
  }

  try {
    // 1. Marcar orden como PAID y actualizar stock
    const order = await markOrderPaid(reference, boldPaymentId);
    console.info("[BOLD WEBHOOK] ✓ Orden marcada como pagada. transactionId:", reference);

    // 2. Enviar correo de confirmación (asincrónico, no bloquea respuesta)
    // Si el correo falla, NO revertimos PAID status — es "best effort"
    try {
      // Validar que el usuario tenga email
      if (!order.user.email) {
        console.warn(`[BOLD WEBHOOK] ⚠ Orden ${order.orderNumber} no tiene email de cliente`);
        updateLog(200);
        return;
      }

      console.log("[BOLD WEBHOOK] 📧 Enviando correo de confirmación...");

      const emailResult = await sendOrderConfirmationEmail({
        customerEmail: order.user.email,
        customerName: order.shippingName,
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          color: item.colorName,
          size: item.size,
          imageUrl: item.imageUrl,
        })),
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        discount: Number(order.discount),
        total: Number(order.total),
      });

      if (emailResult.success) {
        // Registrar que el correo fue enviado exitosamente
        await prisma.order.update({
          where: { id: order.id },
          data: { confirmationEmailSentAt: new Date() },
        });
        console.info(
          `[BOLD WEBHOOK] ✓ Confirmación enviada a ${order.user.email} (messageId: ${emailResult.messageId})`
        );
      } else {
        // Registrar fallo del correo pero NO fallar la orden
        await prisma.order.update({
          where: { id: order.id },
          data: {
            confirmationEmailFailedAt: new Date(),
            confirmationEmailError: emailResult.error || "Error desconocido",
          },
        });
        console.error(
          `[BOLD WEBHOOK] ⚠ Error enviando confirmación a ${order.user.email}: ${emailResult.error}`
        );
      }
    } catch (emailErr) {
      // Capturar cualquier excepción no esperada en el envío de correo
      const emailErrorMsg =
        emailErr instanceof Error ? emailErr.message : "Error desconocido";
      console.error(`[BOLD WEBHOOK] ⚠ Excepción enviando email:`, emailErrorMsg);

      // Registrar el error pero continuar (no fallar la orden)
      try {
        await prisma.order.update({
          where: { transactionId: reference },
          data: {
            confirmationEmailFailedAt: new Date(),
            confirmationEmailError: emailErrorMsg,
          },
        });
      } catch (updateErr) {
        console.error(
          "[BOLD WEBHOOK] ⚠ Error registrando fallo de email:",
          updateErr instanceof Error ? updateErr.message : "Error desconocido"
        );
      }
    }

    updateLog(200);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error desconocido";
    console.error("[BOLD WEBHOOK] ✗ Error al marcar orden como pagada:", errorMessage);
    updateLog(500, errorMessage);
  }
}
