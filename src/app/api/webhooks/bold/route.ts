import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/app/actions/checkout";

// ---------------------------------------------------------------------------
// Bold Webhook — HMAC-SHA256
// Bold envía la firma en el header: "bold-signature"
// El secreto es BOLD_WEBHOOK_SECRET (diferente al BOLD_SECRET_KEY de checkout)
// ---------------------------------------------------------------------------

function verifyBoldSignature(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.BOLD_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Bold Webhook] BOLD_WEBHOOK_SECRET no configurado");
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signatureHeader, "hex"));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  let rawBody: string;
  let payload: Record<string, unknown>;

  try {
    rawBody = await req.text();
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 1. Validar firma HMAC-SHA256
  const signatureHeader = req.headers.get("bold-signature") ?? "";
  if (!verifyBoldSignature(rawBody, signatureHeader)) {
    console.warn("[Bold Webhook] Firma inválida. Posible intento de fraude.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Extraer datos del payload Bold
  const eventType = payload.event as string | undefined;
  const transactionId = (payload.transaction_id ?? payload.order_id) as string | undefined;
  const paymentId = (payload.payment_id ?? payload.id) as string | undefined;
  const status = payload.status as string | undefined;

  // 3. Registrar log del webhook (siempre, para trazabilidad)
  let logEntry;
  try {
    const order = transactionId
      ? await prisma.order.findUnique({ where: { transactionId }, select: { id: true } })
      : null;

    logEntry = await prisma.webhookLog.create({
      data: {
        orderId: order?.id ?? null,
        provider: "BOLD",
        eventType: eventType ?? null,
        payload: payload as any,
        signature: signatureHeader,
        status: 200,
        attempt: 1,
      },
    });
  } catch (logErr) {
    console.error("[Bold Webhook] Error registrando log:", logErr);
  }

  // 4. Procesar solo eventos de pago aprobado
  const isApproved =
    eventType === "payment.approved" ||
    eventType === "PAYMENT_APPROVED" ||
    status === "APPROVED" ||
    status === "approved";

  if (isApproved && transactionId && paymentId) {
    try {
      await markOrderPaid(transactionId, paymentId);
      console.info(`[Bold Webhook] Orden aprobada: ${transactionId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      console.error("[Bold Webhook] Error al marcar orden como pagada:", err);

      // Actualizar log con error
      if (logEntry) {
        await prisma.webhookLog.update({
          where: { id: logEntry.id },
          data: { status: 500, errorMessage },
        });
      }

      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
