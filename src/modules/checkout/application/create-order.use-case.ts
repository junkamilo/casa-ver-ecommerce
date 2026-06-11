import { PrismaCheckoutRepository } from "../infrastructure/prisma-checkout.repository";
import { createOrderInputSchema } from "../contracts/create-order.schema";
import type {
  CreateOrderInputDTO,
  CreateOrderResultDTO,
} from "../contracts/create-order.dto";

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
    const result = await repository.createOrderTransaction(parsed.data);

    return {
      success: true,
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      earlyBirdApplied: result.earlyBirdApplied,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno al crear la orden";
    console.error("[createOrder] Error:", err);
    return { success: false, error: message };
  }
}
