import * as Sentry from "@sentry/nextjs";
import { isApproved, isRejected, isRefunded } from "../domain/bold-status.entity";
import { verifyBoldSignature } from "../infrastructure/bold-signature.verifier";
import { PrismaBoldOrderRepository } from "../infrastructure/prisma-bold-order.repository";
import { WebhookLogRepository } from "@/modules/payments/shared/infrastructure/webhook-log.repository";
import { markOrderPaidUseCase } from "@/modules/orders/application/mark-order-paid.use-case";
import { releaseOrderStockUseCase } from "@/modules/orders/application/release-order-stock.use-case";
import type { BoldWebhookFieldsDTO } from "../contracts/bold.dto";

const orderRepository = new PrismaBoldOrderRepository();
const webhookLogs = new WebhookLogRepository();

// processBoldWebhookAsync — lógica completa en background (después del 200).
//
// Mantiene la misma estructura que el `processWebhookAsync` original:
//   a. Crear log inmediato (antes de validar firma) para auditoría.
//   b. Validar firma HMAC-SHA256.
//   c. Procesar evento → markOrderPaid o releaseOrderStock.
//
// Retorna void; los errores se loguean y reportan a Sentry, nunca relanzan.
export async function processBoldWebhookAsync(fields: BoldWebhookFieldsDTO): Promise<void> {
  const {
    rawBody,
    payload,
    signatureHeader,
    eventType,
    boldPaymentId,
    reference,
    boldStatus,
    paymentMethod: _paymentMethod,
  } = fields;
  void _paymentMethod;

  // ── a. Crear log inmediato (antes de validar firma) ─────────────────────
  let logEntry: { id: string } | undefined;
  try {
    const order = reference
      ? await orderRepository.findOrderIdByTransactionId(reference)
      : null;

    if (reference && !order) {
      console.warn("[BOLD WEBHOOK] ⚠ No se encontró orden con transactionId:", reference);
    }

    logEntry = await webhookLogs.create({
      orderId: order?.id ?? null,
      provider: "BOLD",
      eventType: eventType ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload: payload as any,
      signature: signatureHeader,
      status: 0,
      attempt: 1,
    });
    console.log("[BOLD WEBHOOK] ✓ Log creado:", logEntry.id);
  } catch (logErr) {
    console.error("[BOLD WEBHOOK] ✗ Error al crear log:", logErr);
  }

  const updateLog = (status: number, errorMessage?: string) => {
    if (!logEntry) return;
    webhookLogs
      .update({ id: logEntry.id, status, errorMessage: errorMessage ?? null })
      .catch((e) => console.error("[BOLD WEBHOOK] ✗ Error actualizando log:", e));
  };

  // ── b. Validar firma HMAC-SHA256 ─────────────────────────────────────────
  const sigResult = verifyBoldSignature(rawBody, signatureHeader);

  if (!sigResult.skip && sigResult.valid === false) {
    console.warn("[BOLD WEBHOOK] ✗ Firma HMAC inválida — rechazando petición");
    console.warn(
      "  Verifica que BOLD_WEBHOOK_SECRET sea la llave secreta de Dashboard Bold → Integraciones"
    );
    updateLog(401, "Firma HMAC-SHA256 inválida");
    return;
  }

  if (sigResult.skip) {
    console.log(
      "[BOLD WEBHOOK] ⚠ Procesando sin verificación de firma (sin secreto o sin header)"
    );
  } else {
    console.log("[BOLD WEBHOOK] ✓ Firma HMAC válida");
  }

  // ── c. Procesar evento ───────────────────────────────────────────────────
  const approved = isApproved(eventType, boldStatus);
  const rejected = isRejected(eventType, boldStatus);
  const refunded = isRefunded(eventType, boldStatus);

  if (!approved && !rejected && !refunded) {
    console.log("[BOLD WEBHOOK] ℹ Evento recibido pero no requiere acción:", {
      eventType,
      boldStatus,
    });
    updateLog(200);
    return;
  }

  if (rejected || refunded) {
    const newStatus = refunded ? "REFUNDED" : "FAILED";
    console.log(
      `[BOLD WEBHOOK] ℹ Evento ${eventType ?? boldStatus} → liberando stock y cupón, orden → ${newStatus}`
    );

    if (reference) {
      // releaseOrderStockUseCase es idempotente; si ya está terminal no hace nada.
      await releaseOrderStockUseCase(reference, newStatus as "FAILED" | "REFUNDED");
    }

    updateLog(200);
    return;
  }

  // approved
  if (!reference || !boldPaymentId) {
    const msg = `Faltan campos requeridos: reference=${reference}, boldPaymentId=${boldPaymentId}`;
    console.error("[BOLD WEBHOOK] ✗", msg);
    // 200 para que Bold no reintente — es problema de datos, no del servidor.
    updateLog(200, msg);
    return;
  }

  try {
    await markOrderPaidUseCase(reference, boldPaymentId);
    console.info("[BOLD WEBHOOK] ✓ Orden marcada como pagada. transactionId:", reference);
    updateLog(200);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error desconocido";
    console.error("[BOLD WEBHOOK] ✗ Error al marcar orden como pagada:", errorMessage);

    Sentry.withScope((scope) => {
      scope.setTag("payment_method", "bold");
      scope.setTag("webhook_type", "payment");
      scope.setContext("bold_webhook", { reference, boldPaymentId, eventType });
      scope.setLevel("error");
      Sentry.captureException(err);
    });

    updateLog(500, errorMessage);
  }
}
