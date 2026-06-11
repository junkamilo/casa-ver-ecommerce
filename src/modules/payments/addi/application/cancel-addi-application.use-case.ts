import { AddiHttpClient } from "../infrastructure/addi-http.client";
import { PrismaAddiOrderRepository } from "../infrastructure/prisma-addi-order.repository";
import {
  AddiGatewayError,
  AddiOrderConflictError,
  AddiOrderNotFoundError,
  AddiValidationError,
} from "./addi.errors";
import type { AddiCancelInputDTO, AddiCancelResultDTO, AddiCancelLowLevelResult } from "../contracts/addi.dto";

const repository = new PrismaAddiOrderRepository();
const client = new AddiHttpClient();

// cancelAddiApplicationUseCase — Cancela un crédito Addi aprobado.
//
// Solo para cancelaciones manuales del admin; el flujo normal pasa por
// updateOrderStatus. La autorización admin se valida en el route handler.
//
// Reglas:
//   - orderId requerido
//   - paymentMethod debe ser ADDI
//   - status debe ser PAID o PROCESSING
//   - transactionId requerido
//   - Cancelación TOTAL en Addi (monto = total de la orden)
export async function cancelAddiApplicationUseCase(
  input: AddiCancelInputDTO
): Promise<AddiCancelResultDTO> {
  if (!input.orderId) {
    throw new AddiValidationError("orderId requerido");
  }

  const order = await repository.findOrderForCancel(input.orderId);
  if (!order) {
    throw new AddiOrderNotFoundError("Orden no encontrada");
  }
  if (order.paymentMethod !== "ADDI") {
    throw new AddiValidationError("Esta orden no fue pagada con Addi");
  }
  if (!["PAID", "PROCESSING"].includes(order.status)) {
    throw new AddiOrderConflictError(
      `No se puede cancelar una orden en estado "${order.status}"`
    );
  }
  if (!order.transactionId) {
    throw new AddiValidationError("La orden no tiene transactionId de Addi");
  }

  const result = await client.cancelApplication(order.transactionId, Number(order.total));

  if (!result.success) {
    throw new AddiGatewayError(result.error ?? "Error al cancelar en Addi", 502);
  }

  return { cancelled: true };
}

// Re-export para preservar la API pública de services/addi/cancel.ts.
// Mantiene la firma exacta { success, error } que orders.use-case y
// app/actions/orders esperan.
export async function cancelAddiApplication(
  externalOrderId: string,
  amount: number
): Promise<AddiCancelLowLevelResult> {
  return client.cancelApplication(externalOrderId, amount);
}
