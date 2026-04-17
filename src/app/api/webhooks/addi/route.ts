import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { markOrderPaid, releaseOrderStock } from "@/app/actions/checkout";
import { sendOrderConfirmationEmail } from "@/services/email/client";

// ---------------------------------------------------------------------------
// Addi Webhook — Validación de firma con ADDI_WEBHOOK_SECRET
// Addi envía la firma en: "x-addi-signature" o "x-signature"
// ---------------------------------------------------------------------------

function verifyAddiSignature(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.ADDI_WEBHOOK_SECRET;

  const isProd = process.env.NODE_ENV === "production";

  if (!secret) {
    if (isProd) {
      // En producción sin secreto: rechazar — no podemos verificar integridad
      console.error("[Addi Webhook] ✗ PROD: ADDI_WEBHOOK_SECRET no configurado — rechazando webhook");
      return false;
    }
    console.warn("[Addi Webhook] ADDI_WEBHOOK_SECRET no configurado — omitiendo validación de firma");
    return true;
  }

  if (!signatureHeader) {
    if (isProd) {
      console.error("[Addi Webhook] ✗ PROD: Header de firma ausente — rechazando webhook");
      return false;
    }
    return true;
  }

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

  // 4. Clasificar evento
  const isApproved =
    addiStatus === "APPROVED" ||
    addiStatus === "approved" ||
    eventType === "application.approved";

  const isRejected =
    addiStatus === "REJECTED" ||
    addiStatus === "rejected" ||
    addiStatus === "DECLINED" ||
    addiStatus === "declined" ||
    eventType === "application.rejected" ||
    eventType === "application.declined";

  // 5. Pago rechazado por Addi → liberar stock y cupón
  if (isRejected && orderId) {
    console.log(`[Addi Webhook] Pago rechazado — liberando stock. orderId: ${orderId}`);
    await releaseOrderStock(orderId, "FAILED");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // 6. Procesar pago aprobado
  if (isApproved && orderId && addiPaymentId) {
    try {
      const order = await markOrderPaid(orderId, addiPaymentId);
      console.info(`[Addi Webhook] Orden aprobada: ${orderId}`);

      // Reclamar atómicamente el envío de email para evitar doble envío si el
      // callback de Addi (/api/addi/callback) llega en paralelo.
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
              await prisma.order.update({
                where: { id: order.id },
                data: {
                  confirmationEmailSentAt: null,
                  confirmationEmailFailedAt: new Date(),
                  confirmationEmailError: emailResult.error ?? "Error desconocido",
                },
              }).catch(() => {});
              console.warn("[Addi Webhook] Email falló:", emailResult.error);
            } else {
              console.info("[Addi Webhook] Email enviado:", order.orderNumber);
            }
          } catch (emailErr) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                confirmationEmailSentAt: null,
                confirmationEmailFailedAt: new Date(),
                confirmationEmailError: emailErr instanceof Error ? emailErr.message : "Error desconocido",
              },
            }).catch(() => {});
            console.error("[Addi Webhook] Error enviando email:", emailErr);
          }
        } else {
          console.info(
            "[Addi Webhook] Email ya enviado por otro proceso (callback paralelo):",
            order.orderNumber
          );
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