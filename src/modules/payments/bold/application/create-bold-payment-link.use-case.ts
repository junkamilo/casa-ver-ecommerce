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

function resolveBoldCallbackUrl(appUrl: string, transactionId: string): string {
  const explicit = process.env.BOLD_CALLBACK_URL?.trim();
  const base = explicit
    ? explicit.replace(/\/$/, "")
    : `${appUrl.replace(/\/$/, "")}/pago/resultado`;

  const url = new URL(base);
  url.searchParams.set("reference_id", transactionId);
  return url.toString();
}

function boldLinkErrorMessage(status: number, errorCode: string | undefined, callbackUrl: string): string {
  if (status === 403 && /localhost|127\.0\.0\.1/i.test(callbackUrl)) {
    return (
      "Bold no acepta callback en localhost. En .env.local define " +
      "BOLD_CALLBACK_URL con una URL HTTPS pública (ej. https://casaverdeoficial.com/pago/resultado " +
      "o un túnel ngrok) y reinicia el servidor."
    );
  }
  if (status === 403) {
    return "Bold rechazó la solicitud (403). Verifica que BOLD_IDENTITY_KEY sea la llave de pruebas del panel Bold.";
  }
  if (errorCode) {
    return `Error al crear el link de pago: ${errorCode}`;
  }
  return "Error al crear el link de pago. Intenta de nuevo.";
}

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
  const callbackUrl = resolveBoldCallbackUrl(appUrl, reference);

  if (/localhost|127\.0\.0\.1/i.test(callbackUrl) && !process.env.BOLD_CALLBACK_URL) {
    console.warn(
      "[BOLD] callback_url apunta a localhost — Bold devuelve 403. " +
        "Define BOLD_CALLBACK_URL en .env.local con una URL HTTPS pública."
    );
  }

  console.log("[BOLD] Creando link | reference:", reference, "| amount:", totalAmount, "| callback:", callbackUrl);

  const result = await client.createLink({
    reference,
    totalAmount,
    payerEmail,
    callbackUrl,
    identityKey,
  });

  if (!result.ok) {
    console.error("[BOLD] Error creando link:", result.status, result.errorCode, "| callback:", callbackUrl);
    throw new BoldGatewayError(boldLinkErrorMessage(result.status, result.errorCode, callbackUrl), 502);
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
