import { BoldPaymentClient } from "../infrastructure/bold-payment.client";
import { PrismaBoldOrderRepository } from "../infrastructure/prisma-bold-order.repository";
import { createBoldPaymentInputSchema } from "../contracts/bold.schema";
import {
  BoldConfigError,
  BoldForbiddenError,
  BoldGatewayError,
  BoldOrderConflictError,
  BoldOrderNotFoundError,
  BoldValidationError,
} from "./bold.errors";
import type {
  CreateBoldPaymentInputDTO,
  CreateBoldPaymentResultDTO,
} from "../contracts/bold.dto";

const repository = new PrismaBoldOrderRepository();
const client = new BoldPaymentClient();

// createBoldPaymentLinkUseCase — crea un Link de Pagos en Bold y persiste
// el LNK_* devuelto (necesario para /api/payments/bold/verify).
//
// Reglas de negocio (preservadas byte-a-byte del POST original):
//   - La orden debe existir
//   - Si hay sesión activa, la orden debe pertenecer a ese usuario
//   - La orden debe estar PENDING y configurada como BOLD
//   - La orden debe tener transactionId (UUID del cliente, ≤ 60 chars Bold)
export async function createBoldPaymentLinkUseCase(
  input: CreateBoldPaymentInputDTO
): Promise<CreateBoldPaymentResultDTO> {
  const identityKey = process.env.BOLD_IDENTITY_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!identityKey || !appUrl) {
    console.error("[BOLD] Variables faltantes:", {
      BOLD_IDENTITY_KEY: !!identityKey,
      appUrl: !!appUrl,
    });
    throw new BoldConfigError("Configuración de pasarela de pago incompleta");
  }

  const parsed = createBoldPaymentInputSchema.safeParse({ orderId: input.orderId });
  if (!parsed.success) {
    throw new BoldValidationError(parsed.error.issues[0]?.message ?? "orderId inválido");
  }

  const order = await repository.findOrderForCreatePayment(parsed.data.orderId);
  if (!order) {
    throw new BoldOrderNotFoundError("Orden no encontrada");
  }

  if (input.sessionUserId && order.userId !== input.sessionUserId) {
    console.warn("[BOLD] Intento de pago con orden ajena. userId:", input.sessionUserId);
    throw new BoldForbiddenError("Acceso denegado");
  }

  if (order.status !== "PENDING") {
    throw new BoldOrderConflictError("Esta orden ya fue procesada");
  }

  if (order.paymentMethod !== "BOLD") {
    throw new BoldOrderConflictError("Esta orden no está configurada para pago con Bold");
  }

  if (!order.transactionId) {
    console.error("[BOLD] Orden sin transactionId:", order.id);
    throw new BoldConfigError("Error interno: orden sin referencia de pago");
  }

  const reference = order.transactionId;
  const totalAmount = Math.round(Number(order.total));
  const payerEmail = order.user?.email ?? undefined;

  console.log("[BOLD] Creando link | reference:", reference, "| amount:", totalAmount);

  const result = await client.createLink({
    reference,
    totalAmount,
    payerEmail,
    callbackUrl: `${appUrl}/pago/resultado`,
    identityKey,
  });

  if (!result.ok) {
    console.error("[BOLD] Error creando link:", result.status, result.errorCode);
    throw new BoldGatewayError("Error al crear el link de pago. Intenta de nuevo.", 502);
  }

  // Persistir LNK_* — CRÍTICO: verify lo necesita para consultar Bold
  try {
    await repository.setBoldLinkId(order.id, result.paymentLink);
  } catch (e) {
    console.error("[BOLD] Error guardando boldLinkId — la verificación del pago fallará:", e);
    throw new BoldGatewayError(
      "Error al registrar el link de pago. Intenta de nuevo.",
      500
    );
  }

  console.log("[BOLD] Link creado:", result.paymentLink);
  return { redirectUrl: result.checkoutUrl };
}
