import { PrismaOrderRepository } from "../infrastructure/prisma-order.repository";

const orderRepository = new PrismaOrderRepository();

/**
 * La pasarela reembolsó un pedido que ya estaba pagado: pasa a REFUNDED (idempotente).
 * Devuelve true si el pedido cambió de estado.
 */
export async function markPaidOrderRefundedUseCase(transactionId: string): Promise<boolean> {
  return orderRepository.markPaidOrderRefundedByTransactionId(transactionId);
}
