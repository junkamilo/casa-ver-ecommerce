import { PrismaCheckoutRepository } from "../infrastructure/prisma-checkout.repository";
import { createOrderInputSchema } from "../contracts/create-order.schema";
import type {
  CreateOrderInputDTO,
  CreateOrderResultDTO,
} from "../contracts/create-order.dto";
import {
  OutOfStockError,
  ProductUnavailableError,
  toCreateOrderErrorMessage,
} from "./checkout.errors";
import { verifyPosAvailability } from "@/modules/posIntegration/application/verify-pos-availability.use-case";

const repository = new PrismaCheckoutRepository();

// ---------------------------------------------------------------------------
// createOrderUseCase
//
// Orquesta validación Zod + transacción atómica del repositorio.
//
// IMPORTANTE: el Server Action `createOrder` original NO lanza nunca; mapea
// cualquier excepción a `{ success: false, error: string }`. Para preservar
// ese contrato byte-a-byte (lo consume `useCheckout` y muestra el `error` al
// usuario), aquí capturamos todo y devolvemos el mismo shape.
// ---------------------------------------------------------------------------
export async function createOrderUseCase(
  input: CreateOrderInputDTO
): Promise<CreateOrderResultDTO> {
  // Validación pre-transacción. El schema mantiene los mensajes literales del
  // código legacy ("El carrito está vacío", "Cédula inválida...", etc.) para
  // que la UI siga mostrando los mismos textos.
  const parsed = createOrderInputSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: message };
  }

  try {
    // El POS confirma que alcanza el inventario para las cantidades del carrito antes de cobrar.
    const posIssues = await verifyPosAvailability(
      parsed.data.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
    );
    const firstIssue = posIssues[0];
    if (firstIssue) {
      const item = parsed.data.items.find((i) => i.variantId === firstIssue.variantId);
      const label = item?.name ?? "un producto";
      const remaining = firstIssue.message?.match(/solo quedan \d+ unidad(es)?/)?.[0];
      throw firstIssue.reason === "product_unavailable"
        ? new ProductUnavailableError(`El producto "${label}" ya no está disponible`)
        : new OutOfStockError(
            `Stock insuficiente para "${label}" (${item?.colorName ?? ""} / ${item?.size ?? ""})` +
              (remaining ? `: ${remaining}` : "")
          );
    }

    const result = await repository.createOrderTransaction(parsed.data);

    return {
      success: true,
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      transactionId: result.order.transactionId,
    };
  } catch (err) {
    console.error("[createOrder] Error:", err);
    return { success: false, error: toCreateOrderErrorMessage(err) };
  }
}
