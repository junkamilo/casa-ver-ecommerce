import { PrismaOrderRepository } from "../infrastructure/prisma-order.repository";
import type { PaidOrderDTO } from "../contracts/order-payment.dto";

const orderRepository = new PrismaOrderRepository();

// markOrderPaidUseCase — Marca una orden como PAID atómicamente.
//
// Es la fuente única para los webhooks/callbacks de Bold y Addi y para el
// fallback admin. Idempotente: si la orden ya está PAID retorna sin tocar
// nada.
export async function markOrderPaidUseCase(
  transactionId: string,
  paymentId: string,
): Promise<PaidOrderDTO> {
  return orderRepository.markPaidByTransactionId(transactionId, paymentId);
}
