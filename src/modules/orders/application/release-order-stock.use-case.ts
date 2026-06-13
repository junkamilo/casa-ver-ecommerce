import { PrismaOrderRepository } from "../infrastructure/prisma-order.repository";
import type { ReleaseOrderTargetStatus } from "../contracts/order-payment.dto";

const orderRepository = new PrismaOrderRepository();

// releaseOrderStockUseCase — Libera reservas de stock y cupón.
//
// Se llama desde los webhooks de Bold/Addi cuando la transacción es
// rechazada, cancelada o reembolsada. Es idempotente: si la orden ya está
// en estado terminal o no existe, no hace nada y NO lanza.
export async function releaseOrderStockUseCase(
  transactionId: string,
  newStatus: ReleaseOrderTargetStatus,
): Promise<void> {
  return orderRepository.releaseStockByTransactionId(transactionId, newStatus);
}
