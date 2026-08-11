import { notifyOrderConfirmation } from "@/modules/payments/shared/infrastructure/order-confirmation.notifier";
import { notifyAdminNewOrder } from "@/modules/payments/shared/infrastructure/admin-new-order.notifier";
import { persistAccountingSaleExport } from "@/modules/accounting/application/persist-accounting-sale-export";
import { PrismaOrderRepository } from "../infrastructure/prisma-order.repository";
import type { PaidOrderDTO } from "../contracts/order-payment.dto";

const orderRepository = new PrismaOrderRepository();

// markOrderPaidUseCase — Marca una orden como PAID atómicamente.
//
// Es la fuente única para los webhooks/callbacks de Bold y Addi y para el
// fallback admin. Idempotente: si la orden ya está PAID retorna sin tocar
// nada. Siempre intenta enviar el email de confirmación (idempotente).
// En ventas nuevas también avisa al admin por correo y persiste snapshot
// contable (best-effort).
export async function markOrderPaidUseCase(
  transactionId: string,
  paymentId: string,
): Promise<PaidOrderDTO> {
  const { order, newlyPaid } = await orderRepository.markPaidByTransactionId(
    transactionId,
    paymentId
  );
  await notifyOrderConfirmation(order, { skipIfAlreadySent: true });
  if (newlyPaid) {
    await notifyAdminNewOrder(order);
    void persistAccountingSaleExport(order.id);
  }
  return order;
}
