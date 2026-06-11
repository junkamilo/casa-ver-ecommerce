import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { processBoldWebhookAsync } from "@/modules/payments/bold/application/process-bold-webhook.use-case";

// ---------------------------------------------------------------------------
// Bold Webhook Handler — Next.js App Router (THIN)
//
// Bold cancela la entrega del webhook si no responde en < 2s, así que esta
// ruta:
//   1. Captura rawBody + headers SÍNCRONAMENTE
//   2. Parsea JSON (si falla, persiste log de parse_error y devuelve 400)
//   3. Extrae los campos del payload
//   4. Responde 200 INMEDIATAMENTE
//   5. Procesa todo lo demás dentro de `after()` con el use case
//      processBoldWebhookAsync (firma HMAC, log, markPaid o releaseStock).
//
// Eventos Bold (Payment Intent API):
//   SALE_APPROVED        → pago exitoso  ✅
//   SALE_REJECTED        → pago rechazado
//   VOID_APPROVED        → anulación aprobada (mismo día, antes 9 PM)
//   VOID_REJECTED        → anulación rechazada
//
// Campos clave en el payload de producción:
//   data.transaction_id  → ID único de la transacción Bold
//   data.reference_id    → nuestro reference (transactionId de la orden)
//   data.status          → APPROVED | REJECTED | RUNNING | CANCELLED
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  console.log("[BOLD WEBHOOK] Solicitud recibida:", new Date().toISOString());

  const signatureHeader = req.headers.get("x-bold-signature") ?? "";
  console.log("[BOLD WEBHOOK] x-bold-signature:", signatureHeader || "(ausente)");

  let rawBody: string;
  try {
    rawBody = await req.text();
    if (process.env.NODE_ENV !== "production") {
      console.log("[BOLD WEBHOOK] Body raw (dev only):", rawBody.slice(0, 300));
    }
  } catch (err) {
    console.error("[BOLD WEBHOOK] ✗ No se pudo leer el body:", err);
    return NextResponse.json({ error: "Cannot read body" }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error("[BOLD WEBHOOK] ✗ JSON inválido. Body recibido:", rawBody.slice(0, 500));

    // Persistir log de error de parseo en background
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
        .catch((e) =>
          console.error("[BOLD WEBHOOK] ✗ No se pudo registrar error de parse:", e)
        );
    });

    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Bold Payment Intent API envía estructura anidada:
  //   { type, data: { transaction_id, reference_id, status, amount, payment_method } }
  const data = (payload.data ?? payload) as Record<string, unknown>;
  const eventType = (payload.type ?? payload.event ?? data.event) as string | undefined;

  // transaction_id es el ID de Bold (nuevo API); fallback a payment_id / id para compatibilidad
  const boldPaymentId = (data.transaction_id ?? data.payment_id ?? data.id ?? payload.id) as
    | string
    | undefined;

  // reference_id es nuestro identificador de orden (nuevo API); fallback a metadata.reference
  const metadata = (data.metadata ?? payload.metadata) as Record<string, unknown> | undefined;
  const reference = (data.reference_id ?? metadata?.reference ?? data.reference ?? payload.reference) as
    | string
    | undefined;

  const boldStatus = (data.status ?? payload.status) as string | undefined;
  const amount = ((data.amount as Record<string, unknown>)?.total_amount ??
    (data.amount as Record<string, unknown>)?.total ??
    (payload.amount as Record<string, unknown>)?.total_amount ??
    (payload.amount as Record<string, unknown>)?.total) as number | undefined;
  const paymentMethod = (data.payment_method ?? payload.payment_method) as string | undefined;

  console.log(
    "[BOLD WEBHOOK] Evento:",
    eventType,
    "| Referencia:",
    reference,
    "| Estado:",
    boldStatus
  );

  // Responder 200 INMEDIATAMENTE — Bold cancela si no respondemos < 2s.
  // Toda la lógica real va dentro de after() vía el use case.
  after(async () => {
    await processBoldWebhookAsync({
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
