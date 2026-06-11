import * as Sentry from "@sentry/nextjs";
import { verifyAddiSignature } from "../infrastructure/addi-signature.verifier";
import { PrismaAddiOrderRepository } from "../infrastructure/prisma-addi-order.repository";
import { isWebhookApproved, isWebhookRejected } from "../domain/addi-status.entity";
import { AddiUnauthorizedError } from "./addi.errors";
import { WebhookLogRepository } from "@/modules/payments/shared/infrastructure/webhook-log.repository";
import { notifyOrderConfirmation } from "@/modules/payments/shared/infrastructure/order-confirmation.notifier";
import { markOrderPaidUseCase } from "@/modules/orders/application/mark-order-paid.use-case";
import { releaseOrderStockUseCase } from "@/modules/orders/application/release-order-stock.use-case";
import type { AddiWebhookInputDTO } from "../contracts/addi.dto";

const repository = new PrismaAddiOrderRepository();
const webhookLogs = new WebhookLogRepository();

// processAddiWebhookUseCase — Procesa el webhook POST de Addi.
//
// Addi envía la firma en "x-addi-signature" o "x-signature".
// Estructura del payload puede ser laxa, así que extraemos campos con fallbacks.
//
// Lanza AddiUnauthorizedError si la firma es inválida (route handler → 401).
// Para errores al marcar PAID, lanza Error genérico (route handler → 500 →
// Addi reintenta).
export async function processAddiWebhookUseCase(input: AddiWebhookInputDTO): Promise<void> {
  if (!verifyAddiSignature(input.rawBody, input.signatureHeader)) {
    console.warn("[Addi Webhook] Firma inválida.");
    throw new AddiUnauthorizedError();
  }

  const { payload, signatureHeader } = input;

  // Extraer datos (estructura Addi)
  const eventType = payload.event as string | undefined;
  const orderId = (payload.orderId ?? payload.order_id ?? payload.externalId) as string | undefined;
  const addiPaymentId = (payload.id ?? payload.applicationId) as string | undefined;
  const addiStatus = (payload.status ?? payload.applicationStatus) as string | undefined;

  // Log del webhook
  let logEntry: { id: string } | undefined;
  try {
    const order = orderId
      ? await repository.findOrderIdByTransactionId(orderId)
      : null;

    logEntry = await webhookLogs.create({
      orderId: order?.id ?? null,
      provider: "ADDI",
      eventType: eventType ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload: payload as any,
      signature: signatureHeader,
      status: 200,
      attempt: 1,
    });
  } catch (logErr) {
    console.error("[Addi Webhook] Error registrando log:", logErr);
  }

  const approved = isWebhookApproved(eventType, addiStatus);
  const rejected = isWebhookRejected(eventType, addiStatus);

  // Pago rechazado por Addi → liberar stock y cupón
  if (rejected && orderId) {
    console.log(`[Addi Webhook] Pago rechazado — liberando stock. orderId: ${orderId}`);
    await releaseOrderStockUseCase(orderId, "FAILED");
    return;
  }

  // Procesar pago aprobado
  if (approved && orderId && addiPaymentId) {
    try {
      const order = await markOrderPaidUseCase(orderId, addiPaymentId);
      console.info(`[Addi Webhook] Orden aprobada: ${orderId}`);

      await notifyOrderConfirmation(order);
      console.info("[Addi Webhook] Email encolado para orden:", order.orderNumber);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      console.error("[Addi Webhook] Error al marcar orden como pagada:", err);

      Sentry.withScope((scope) => {
        scope.setTag("payment_method", "addi");
        scope.setTag("webhook_type", "payment");
        scope.setContext("addi_webhook", { orderId });
        scope.setLevel("error");
        Sentry.captureException(err);
      });

      if (logEntry) {
        await webhookLogs
          .update({ id: logEntry.id, status: 500, errorMessage })
          .catch(() => {});
      }

      // Lanzar para que el route handler retorne 500 → Addi reintenta.
      throw new Error("Internal error");
    }
  }
}
