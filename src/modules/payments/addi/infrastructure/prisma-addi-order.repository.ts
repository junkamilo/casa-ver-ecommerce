import { prisma } from "@/lib/prisma";

// Repositorio Prisma específico para los flujos Addi.
export class PrismaAddiOrderRepository {
  // POST /api/payments/addi — necesita items + email del usuario para
  // construir el payload Addi.
  async findOrderForCreateApplication(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId.trim() },
      include: {
        items: true,
        user: { select: { id: true, email: true } },
      },
    });
  }

  // POST /api/addi/cancel — datos mínimos para validar y cancelar.
  async findOrderForCancel(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        transactionId: true,
        total: true,
        paymentMethod: true,
        status: true,
      },
    });
  }

  // Para el callback / webhook: validar monto y procesar.
  async findOrderByTransactionIdForCallback(externalOrderId: string) {
    return prisma.order.findUnique({
      where: { transactionId: externalOrderId },
      select: { id: true, total: true, status: true },
    });
  }

  async findOrderIdByTransactionId(transactionId: string): Promise<{ id: string } | null> {
    return prisma.order.findUnique({
      where: { transactionId },
      select: { id: true },
    });
  }
}
