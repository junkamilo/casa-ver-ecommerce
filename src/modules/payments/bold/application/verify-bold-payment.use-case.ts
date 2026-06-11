import { BoldPaymentClient } from "../infrastructure/bold-payment.client";
import { PrismaBoldOrderRepository } from "../infrastructure/prisma-bold-order.repository";
import {
  BoldConfigError,
  BoldGatewayError,
  BoldOrderNotFoundError,
  BoldValidationError,
} from "./bold.errors";
import { mapBoldStatusToUiStatus, shouldMarkAsFailed } from "../domain/bold-status.entity";
import { markOrderPaidUseCase } from "@/modules/orders/application/mark-order-paid.use-case";
import { notifyOrderConfirmation } from "@/modules/payments/shared/infrastructure/order-confirmation.notifier";
import type {
  VerifyBoldPaymentInputDTO,
  VerifyBoldPaymentResultDTO,
} from "../contracts/bold.dto";

const repository = new PrismaBoldOrderRepository();
const client = new BoldPaymentClient();

// verifyBoldPaymentUseCase — Polling/redirect de Bold.
//
// Bold redirige al cliente a /pago/resultado?reference_id={transactionId}.
// La página llama a este use case que:
//   1. Si la orden ya está PAID → status APPROVED (webhook llegó antes)
//   2. Si la orden no tiene boldLinkId (Bold Botón de Pagos) → RUNNING (esperar webhook)
//   3. Caso normal: consultar el link en Bold y reaccionar:
//      - PAID → markOrderPaid + notificar email
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
    console.error("[BOLD CALLBACK] Orden no encontrada para transactionId:", input.referenceId);
    throw new BoldOrderNotFoundError("Orden no encontrada");
  }

  // Webhook adelantado: si ya está PAID, devolver APPROVED directo.
  if (order.status === "PAID") {
    console.log("[BOLD CALLBACK] Orden ya marcada como PAID (webhook adelantado)");
    return { status: "APPROVED", orderId: order.id };
  }

  // Órdenes de Bold Botón de Pagos no tienen boldLinkId — el webhook se
  // encarga; aquí solo devolvemos RUNNING para que el polling siga esperando.
  if (!order.boldLinkId) {
    console.log(
      "[BOLD CALLBACK] Orden sin boldLinkId (Bold Botón de Pagos) — esperando webhook, devolviendo RUNNING"
    );
    return { status: "RUNNING", orderId: order.id };
  }

  console.log("[BOLD CALLBACK] Consultando link:", order.boldLinkId);

  const result = await client.getLinkStatus(order.boldLinkId, apiKey);
  if (!result.ok) {
    console.error(
      "[BOLD CALLBACK] Error Bold API:",
      result.status,
      (result.body ?? "").slice(0, 200)
    );
    throw new BoldGatewayError(`Bold API ${result.status}`, 502);
  }

  console.log("[BOLD CALLBACK] Estado del link recibido:", {
    status: result.data?.status ?? result.data?.payload?.status,
  });

  const boldStatus = ((result.data.status ?? result.data.payload?.status ?? "UNKNOWN") as string).toUpperCase();
  const uiStatus = mapBoldStatusToUiStatus(boldStatus);

  if (boldStatus === "PAID") {
    try {
      // payment_id / transaction_id = ID real (preferido); id = LNK_* (último recurso)
      const boldPaymentId =
        (result.data.payment_id as string | undefined) ??
        (result.data.transaction_id as string | undefined) ??
        (result.data.id as string | undefined) ??
        order.boldLinkId ??
        `bold-verify-${input.referenceId}`;

      const paidOrder = await markOrderPaidUseCase(input.referenceId, boldPaymentId);

      // Si el correo aún no fue enviado, encolarlo (puede llegar antes que el webhook).
      await notifyOrderConfirmation(paidOrder, { skipIfAlreadySent: true });
    } catch (e) {
      // Idempotente: si ya está pagado no es un error real.
      console.warn("[BOLD CALLBACK] markOrderPaid (posiblemente idempotente):", e);
    }
  } else if (shouldMarkAsFailed(boldStatus)) {
    await repository.markPendingAsFailedByTransactionId(input.referenceId);
  }

  return { status: uiStatus, orderId: order.id };
}
