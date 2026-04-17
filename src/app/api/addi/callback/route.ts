import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { markOrderPaid, releaseOrderStock } from "@/app/actions/checkout";
import { sendOrderConfirmationEmail } from "@/services/email/client";

// ---------------------------------------------------------------------------
// Addi — Callback de resultado de aplicación de crédito
//
// Addi hace POST a esta URL cuando el crédito se resuelve (APPROVED, REJECTED…).
// Estructura del body según docs (OnlineLoanApplicationCallbackRequest):
//   { orderId, applicationId, approvedAmount, currency, status, statusTimestamp }
//
// Statuses posibles: APPROVED | PENDING | REJECTED | ABANDONED | DECLINED | INTERNAL_ERROR
//
// Seguridad:
// - ADDI_CALLBACK_SECRET se incluye como ?key=... en la callbackUrl enviada a Addi.
//   Solo Addi conoce esa URL exacta, por lo que ningún tercero puede disparar el endpoint.
// - `orderId` debe ser un UUID válido (transactionId generado por nosotros con randomUUID)
// - `approvedAmount` se valida contra el total real de la orden (tolerancia 100 COP por redondeo)
// - `markOrderPaid` es idempotente — si la orden ya está PAID, no hace nada
// - Email se reclama atómicamente para evitar doble envío si callback + webhook llegan juntos
// - Los errores internos devuelven 200 a Addi para evitar reintentos infinitos,
//   excepto errores al marcar PAID (devuelven 500 para que Addi reintente)
// ---------------------------------------------------------------------------

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidOrderId(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function isValidApplicationId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length >= 4 && value.trim().length <= 128;
}

function isValidStatus(value: unknown): value is string {
  return (
    typeof value === "string" &&
    ["APPROVED", "PENDING", "REJECTED", "ABANDONED", "DECLINED", "INTERNAL_ERROR"].includes(
      value.toUpperCase()
    )
  );
}

// Valida que la request incluya la clave secreta correcta en el query param ?key=
// En producción, rechaza si la clave no está configurada o no coincide.
// En desarrollo, omite la validación para facilitar pruebas locales.
function verifyCallbackKey(req: NextRequest): boolean {
  const secret = process.env.ADDI_CALLBACK_SECRET ?? "";
  const isProd = process.env.NODE_ENV === "production";

  if (!secret) {
    if (isProd) {
      console.error("[Addi Callback] ADDI_CALLBACK_SECRET no configurado en producción — rechazando");
      return false;
    }
    console.warn("[Addi Callback] ADDI_CALLBACK_SECRET no configurado — omitiendo validación (solo dev)");
    return true;
  }

  const providedKey = new URL(req.url).searchParams.get("key") ?? "";
  if (!providedKey) {
    console.warn("[Addi Callback] Clave de acceso ausente en la URL del callback");
    return false;
  }

  try {
    // timingSafeEqual previene timing attacks al comparar la clave
    return timingSafeEqual(
      Buffer.from(secret, "utf8"),
      Buffer.from(providedKey, "utf8"),
    );
  } catch {
    // timingSafeEqual lanza si los buffers tienen longitudes distintas
    return false;
  }
}

export async function POST(req: NextRequest) {
  // ── 1. Validar clave secreta ──────────────────────────────────────────────
  if (!verifyCallbackKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Parsear body ───────────────────────────────────────────────────────
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    orderId: externalOrderId,
    applicationId,
    status,
    approvedAmount,
  } = payload as Record<string, unknown>;

  // ── 3. Validar campos ─────────────────────────────────────────────────────
  if (!isValidOrderId(externalOrderId)) {
    console.warn("[Addi Callback] orderId inválido o ausente:", externalOrderId);
    return NextResponse.json({ error: "orderId inválido" }, { status: 400 });
  }

  if (!isValidStatus(status)) {
    console.warn("[Addi Callback] status inválido:", status);
    return NextResponse.json({ error: "status inválido" }, { status: 400 });
  }

  const normalizedStatus = (status as string).toUpperCase();

  console.log("[Addi Callback] Recibido:", {
    orderId: externalOrderId,
    applicationId: typeof applicationId === "string" ? applicationId : "(ausente)",
    status: normalizedStatus,
    approvedAmount,
  });

  // ── 4. Buscar orden una sola vez con todos los campos necesarios ──────────
  let orderRecord: { id: string; total: unknown; status: string } | null = null;
  try {
    orderRecord = await prisma.order.findUnique({
      where: { transactionId: externalOrderId },
      select: { id: true, total: true, status: true },
    });
  } catch (lookupErr) {
    console.error("[Addi Callback] Error buscando orden:", lookupErr);
  }

  // ── 5. Registrar en WebhookLog para auditoría (con deduplicación) ─────────
  let logEntry: { id: string } | undefined;
  try {
    const eventType = `callback.${normalizedStatus.toLowerCase()}`;
    const alreadyLogged = orderRecord
      ? await prisma.webhookLog.findFirst({
          where: { orderId: orderRecord.id, eventType },
          select: { id: true },
        })
      : null;

    if (!alreadyLogged) {
      logEntry = await prisma.webhookLog.create({
        data: {
          orderId: orderRecord?.id ?? null,
          provider: "ADDI",
          eventType,
          payload: payload as any,
          signature: "",
          status: 200,
          attempt: 1,
        },
      });
    } else {
      console.info(
        `[Addi Callback] Callback ${normalizedStatus} duplicado ignorado para orden: ${orderRecord!.id}`
      );
    }
  } catch (logErr) {
    console.error("[Addi Callback] Error registrando log:", logErr);
  }

  // ── 6. Procesar según estado ──────────────────────────────────────────────
  if (normalizedStatus === "APPROVED") {
    if (!isValidApplicationId(applicationId)) {
      console.error("[Addi Callback] APPROVED sin applicationId válido:", applicationId);
      return NextResponse.json({ error: "applicationId requerido y válido" }, { status: 400 });
    }

    // Validar que el monto aprobado coincida con el total de la orden.
    // Protege contra manipulación donde alguien aprueba un monto menor al real.
    if (orderRecord) {
      const expectedTotal = Number(orderRecord.total);
      const receivedAmount =
        typeof approvedAmount === "number"
          ? approvedAmount
          : typeof approvedAmount === "string"
          ? parseFloat(approvedAmount)
          : NaN;

      if (!isNaN(receivedAmount) && receivedAmount < expectedTotal - 100) {
        console.error(
          `[Addi Callback] Monto aprobado insuficiente. Esperado: ${expectedTotal} COP, ` +
          `Recibido: ${receivedAmount} COP. orderId: ${externalOrderId}`
        );
        if (logEntry) {
          await prisma.webhookLog
            .update({
              where: { id: logEntry.id },
              data: {
                status: 422,
                errorMessage: `Monto insuficiente: esperado ${expectedTotal}, recibido ${receivedAmount}`,
              },
            })
            .catch(() => {});
        }
        // Retornamos 200 para que Addi no reintente — el problema no es transitorio.
        // El admin debe investigar manualmente vía WebhookLog.
        return NextResponse.json({ received: true }, { status: 200 });
      }
    }

    try {
      const order = await markOrderPaid(externalOrderId, (applicationId as string).trim());
      console.info("[Addi Callback] Orden marcada como pagada:", order.orderNumber);

      // Reclamar atómicamente el envío de email para evitar doble envío si el
      // webhook de Addi llega en paralelo. Solo el proceso que actualiza la fila
      // (count > 0) envía el correo.
      if (order.user?.email) {
        const emailClaim = await prisma.order.updateMany({
          where: { id: order.id, confirmationEmailSentAt: null },
          data: { confirmationEmailSentAt: new Date() },
        });

        if (emailClaim.count > 0) {
          try {
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
                imageUrl: item.imageUrl ?? undefined,
              })),
              subtotal: Number(order.subtotal),
              shippingCost: Number(order.shippingCost),
              discount: Number(order.discount),
              total: Number(order.total),
            });

            if (!emailResult.success) {
              // Revertir el claim para que otro intento o reintento manual pueda enviarlo
              await prisma.order
                .update({
                  where: { id: order.id },
                  data: {
                    confirmationEmailSentAt: null,
                    confirmationEmailFailedAt: new Date(),
                    confirmationEmailError: emailResult.error ?? "Error desconocido",
                  },
                })
                .catch(() => {});
              console.warn("[Addi Callback] Email falló:", emailResult.error);
            } else {
              console.info("[Addi Callback] Email de confirmación enviado:", order.orderNumber);
            }
          } catch (emailErr) {
            await prisma.order
              .update({
                where: { id: order.id },
                data: {
                  confirmationEmailSentAt: null,
                  confirmationEmailFailedAt: new Date(),
                  confirmationEmailError:
                    emailErr instanceof Error ? emailErr.message : "Error desconocido",
                },
              })
              .catch(() => {});
            console.error("[Addi Callback] Error enviando email:", emailErr);
          }
        } else {
          console.info(
            "[Addi Callback] Email ya enviado por otro proceso (webhook paralelo):",
            order.orderNumber
          );
        }
      } else {
        console.warn("[Addi Callback] Orden sin email de cliente:", externalOrderId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      console.error("[Addi Callback] Error al marcar orden como pagada:", errorMessage);

      if (logEntry) {
        await prisma.webhookLog
          .update({
            where: { id: logEntry.id },
            data: { status: 500, errorMessage },
          })
          .catch(() => {});
      }

      // Retornamos 500 para que Addi reintente el callback
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
  } else if (normalizedStatus !== "PENDING") {
    // REJECTED / DECLINED / ABANDONED / INTERNAL_ERROR
    // Usar releaseOrderStock para liberar stock, cupón y early bird de forma atómica.
    // El webhook de Addi (/api/webhooks/addi) puede correr en paralelo — releaseOrderStock
    // es idempotente (verifica que la orden siga en PENDING antes de actuar).
    const statusMap: Record<string, "FAILED" | "CANCELLED"> = {
      REJECTED: "FAILED",
      DECLINED: "FAILED",
      INTERNAL_ERROR: "FAILED",
      ABANDONED: "CANCELLED",
    };
    const newStatus = statusMap[normalizedStatus];

    if (newStatus) {
      await releaseOrderStock(externalOrderId, newStatus);
      console.info(
        `[Addi Callback] ${normalizedStatus} → releaseOrderStock(${newStatus}): ${externalOrderId}`
      );
    }
  } else {
    // PENDING — Addi aún está procesando, no hacer nada
    console.info(`[Addi Callback] Estado PENDING recibido para orden: ${externalOrderId}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
