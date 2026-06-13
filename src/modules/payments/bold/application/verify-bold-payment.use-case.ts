import { BoldPaymentClient } from "../infrastructure/bold-payment.client";
import { PrismaBoldOrderRepository } from "../infrastructure/prisma-bold-order.repository";
import {
  BoldConfigError,
  BoldGatewayError,
  BoldOrderNotFoundError,
  BoldValidationError,
} from "./bold.errors";
import {
  extractBoldLinkStatus,
  isApproved,
  mapBoldStatusToUiStatus,
  shouldMarkAsFailed,
} from "../domain/bold-status.entity";
import { markOrderPaidUseCase } from "@/modules/orders/application/mark-order-paid.use-case";
import { notifyOrderConfirmation } from "@/modules/payments/shared/infrastructure/order-confirmation.notifier";
import type {
  VerifyBoldPaymentInputDTO,
  VerifyBoldPaymentResultDTO,
} from "../contracts/bold.dto";

const repository = new PrismaBoldOrderRepository();
const client = new BoldPaymentClient();

async function tryMarkOrderPaid(
  transactionId: string,
  boldPaymentId: string
): Promise<void> {
  try {
    const paidOrder = await markOrderPaidUseCase(transactionId, boldPaymentId);
    await notifyOrderConfirmation(paidOrder, { skipIfAlreadySent: true });
  } catch (e) {
    console.warn("[BOLD CALLBACK] markOrderPaid (posiblemente idempotente):", e);
  }
}

// verifyBoldPaymentUseCase — Polling/redirect de Bold.
//
// Bold redirige al cliente a /pago/resultado?reference_id={transactionId}.
// La página llama a este use case que:
//   1. Si la orden ya está PAID → status APPROVED (webhook adelantado)
//   2. Si la orden no tiene boldLinkId (Bold Botón de Pagos) → RUNNING (esperar webhook)
//   3. Caso normal: consultar el link en Bold y reaccionar:
//      - PAID/APPROVED → markOrderPaid + notificar email
//      - REJECTED/CANCELLED/EXPIRED → marcar orden FAILED (si seguía PENDING)
export async function verifyBoldPaymentUseCase(
  input: VerifyBoldPaymentInputDTO
): Promise<VerifyBoldPaymentResultDTO> {
  if (!input.referenceId) {
    throw new BoldValidationError("reference_id requerido");
  }

  const apiKey = process.env.BOLD_IDENTITY_KEY;
  if (!apiKey) {
    throw new BoldConfigError("BOLD_IDENTITY_KEY no configurada");
  }

  console.log("[BOLD CALLBACK] reference_id recibido:", input.referenceId);

  const order = await repository.findOrderForVerify(input.referenceId);
  if (!order) {
    console.error("[BOLD CALLBACK] Orden no encontrada para referencia:", input.referenceId);
    throw new BoldOrderNotFoundError("Orden no encontrada");
  }

  const transactionId = order.transactionId ?? input.referenceId;

  if (order.status === "PAID") {
    console.log("[BOLD CALLBACK] Orden ya marcada como PAID (webhook adelantado)");
    const paidOrder = await repository.findPaidOrderForNotify(transactionId);
    if (paidOrder) {
      await notifyOrderConfirmation(paidOrder, { skipIfAlreadySent: true });
    }
    return { status: "APPROVED", orderId: order.id };
  }

  if (!order.boldLinkId) {
    console.log(
      "[BOLD CALLBACK] Orden sin boldLinkId (Bold Botón de Pagos) — esperando webhook, devolviendo RUNNING"
    );
    return { status: "RUNNING", orderId: order.id };
  }

  console.log("[BOLD CALLBACK] Consultando link:", order.boldLinkId);

  const result = await client.getLinkStatus(order.boldLinkId, apiKey);
  if (!result.ok) {
    const bodyPreview = (result.body ?? "").slice(0, 200);
    console.error("[BOLD CALLBACK] Error Bold API:", result.status, bodyPreview);

    if (result.status === 404) {
      throw new BoldGatewayError(
        "No se encontró el link de pago en Bold. Si estás en modo pruebas, verifica que BOLD_IDENTITY_KEY sea la llave de sandbox en este entorno.",
        502
      );
    }

    throw new BoldGatewayError(`Bold API ${result.status}`, 502);
  }

  const boldStatus = extractBoldLinkStatus(result.data as Record<string, unknown>);
  console.log("[BOLD CALLBACK] Estado del link recibido:", boldStatus);

  const uiStatus = mapBoldStatusToUiStatus(boldStatus);

  if (isApproved(undefined, boldStatus)) {
    const linkData = result.data as Record<string, unknown>;
    const boldPaymentId =
      (linkData.transaction_id as string | undefined) ??
      (linkData.payment_id as string | undefined) ??
      (linkData.id as string | undefined) ??
      order.boldLinkId ??
      `bold-verify-${transactionId}`;

    await tryMarkOrderPaid(transactionId, boldPaymentId);
  } else if (shouldMarkAsFailed(boldStatus)) {
    await repository.markPendingAsFailedByTransactionId(transactionId);
  } else if (boldStatus === "PROCESSING" || boldStatus === "ACTIVE") {
    return { status: "RUNNING", orderId: order.id };
  }

  return { status: uiStatus, orderId: order.id };
}
