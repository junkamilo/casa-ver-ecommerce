import { PrismaOrderRepository } from "../infrastructure/prisma-order.repository";
import type { ReleaseOrderTargetStatus } from "../contracts/order-payment.dto";
import { releasePosReservation } from "@/modules/posIntegration/application/reserve-pos-stock.use-case";

const orderRepository = new PrismaOrderRepository();

// releaseOrderStockUseCase — Cierra el pedido sin pagar y suelta su reserva de inventario en el POS.
//
// Se llama desde los webhooks de Bold/Addi cuando la transacción es
// rechazada, cancelada o reembolsada. Es idempotente: si la orden ya está
// en estado terminal o no existe, no hace nada y NO lanza. Si el POS no
// responde, la reserva vence sola.
export async function releaseOrderStockUseCase(
  transactionId: string,
  newStatus: ReleaseOrderTargetStatus,
): Promise<void> {
  const orderNumber = await orderRepository.releaseStockByTransactionId(transactionId, newStatus);
  if (orderNumber) await releasePosReservation(orderNumber);
}
