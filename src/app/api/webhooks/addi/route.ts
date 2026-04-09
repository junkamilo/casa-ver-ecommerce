import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/app/actions/checkout";
import { sendOrderConfirmationEmail } from "@/services/email/client";

// ---------------------------------------------------------------------------
// Addi Webhook — Validación de firma con ADDI_WEBHOOK_SECRET
// Addi envía la firma en: "x-addi-signature" o "x-signature"
// ---------------------------------------------------------------------------

function verifyAddiSignature(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.ADDI_WEBHOOK_SECRET;

  // Si el secret no está configurado, loguear advertencia y permitir el webhook.
  // Esto evita bloquear todos los eventos mientras el secret está pendiente de Addi.
  if (!secret) {
    console.warn("[Addi Webhook] ADDI_WEBHOOK_SECRET no configurado — omitiendo validación de firma");
    return true;
  }

  if (!signatureHeader) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("base64");

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
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

  // 1. Validar firma
  const signatureHeader =
    req.headers.get("x-addi-signature") ?? req.headers.get("x-signature") ?? "";

  if (!verifyAddiSignature(rawBody, signatureHeader)) {
    console.warn("[Addi Webhook] Firma inválida.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Extraer datos (estructura Addi)
  const eventType = payload.event as string | undefined;
  const orderId = (payload.orderId ?? payload.order_id ?? payload.externalId) as string | undefined;
  const addiPaymentId = (payload.id ?? payload.applicationId) as string | undefined;
  const addiStatus = (payload.status ?? payload.applicationStatus) as string | undefined;

  // 3. Log del webhook
  let logEntry: { id: string } | undefined;
  try {
    const order = orderId
      ? await prisma.order.findUnique({ where: { transactionId: orderId }, select: { id: true } })
      : null;

    logEntry = await prisma.webhookLog.create({
      data: {
        orderId: order?.id ?? null,
        provider: "ADDI",
        eventType: eventType ?? null,
        payload: payload as any,
        signature: signatureHeader,
        status: 200,
        attempt: 1,
      },
    });
  } catch (logErr) {
    console.error("[Addi Webhook] Error registrando log:", logErr);
  }

  // 4. Procesar pago aprobado
  const isApproved =
    addiStatus === "APPROVED" ||
    addiStatus === "approved" ||
    eventType === "application.approved";

  if (isApproved && orderId && addiPaymentId) {
    try {
      const order = await markOrderPaid(orderId, addiPaymentId);
      console.info(`[Addi Webhook] Orden aprobada: ${orderId}`);

      // Enviar email de confirmación — "best effort": si falla no revertimos el PAID
      if (order.user?.email) {
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

          if (emailResult.success) {
            await prisma.order.update({
              where: { id: order.id },
              data: { confirmationEmailSentAt: new Date() },
            });
            console.info("[Addi Webhook] Email enviado:", order.orderNumber);
          } else {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                confirmationEmailFailedAt: new Date(),
                confirmationEmailError: emailResult.error ?? "Error desconocido",
              },
            });
            console.warn("[Addi Webhook] Email falló:", emailResult.error);
          }
        } catch (emailErr) {
          console.error("[Addi Webhook] Error enviando email:", emailErr);
          await prisma.order.update({
            where: { id: order.id },
            data: {
              confirmationEmailFailedAt: new Date(),
              confirmationEmailError: emailErr instanceof Error ? emailErr.message : "Error desconocido",
            },
          }).catch(() => {});
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      console.error("[Addi Webhook] Error al marcar orden como pagada:", err);

      if (logEntry) {
        await prisma.webhookLog.update({
          where: { id: logEntry.id },
          data: { status: 500, errorMessage },
        }).catch(() => {});
      }

      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}