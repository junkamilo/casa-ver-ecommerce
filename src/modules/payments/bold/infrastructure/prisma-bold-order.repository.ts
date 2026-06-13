import { prisma } from "@/lib/prisma";

// Repositorio Prisma específico para los flujos Bold (crear link, verify
// y webhook). Aísla los queries necesarios para cada caso de uso.
export class PrismaBoldOrderRepository {
  // Para POST /api/payments/bold — necesita transactionId, total y email del usuario.
  async findOrderForCreatePayment(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        transactionId: true,
        total: true,
        status: true,
        paymentMethod: true,
        userId: true,
        user: { select: { email: true } },
      },
    });
  }

  // Persiste el LNK_* que Bold devuelve al crear el link. Necesario para que
  // /api/payments/bold/verify pueda consultar el estado del link.
  async setBoldLinkId(orderId: string, boldLinkId: string): Promise<void> {
    await prisma.order.update({
      where: { id: orderId },
      data: { boldLinkId },
    });
  }

  // Para GET /api/payments/bold/verify?reference_id=...
  // reference puede ser transactionId (UUID) o boldLinkId (LNK_*)
  async findOrderForVerify(reference: string) {
    const byTransaction = await prisma.order.findUnique({
      where: { transactionId: reference },
      select: { id: true, boldLinkId: true, status: true, transactionId: true },
    });
    if (byTransaction) return byTransaction;

    return prisma.order.findFirst({
      where: { boldLinkId: reference },
      select: { id: true, boldLinkId: true, status: true, transactionId: true },
    });
  }

  // Para reenviar confirmación si la orden ya está PAID pero el email no se encoló.
  async findPaidOrderForNotify(transactionId: string) {
    return prisma.order.findUnique({
      where: { transactionId },
      include: { items: true, user: true },
    });
  }

  // Marca como FAILED — solo si la orden sigue PENDING (idempotente,
  // no sobreescribe un PAID que llegó vía webhook).
  async markPendingAsFailedByTransactionId(transactionId: string): Promise<void> {
    try {
      await prisma.order.updateMany({
        where: { transactionId, status: "PENDING" },
        data: { status: "FAILED" },
      });
    } catch (e) {
      console.error("[BOLD] Error actualizando orden a FAILED:", e);
    }
  }

  // Para los webhooks: busca solo el ID interno por transactionId externo.
  async findOrderIdByTransactionId(transactionId: string): Promise<{ id: string } | null> {
    return prisma.order.findUnique({
      where: { transactionId },
      select: { id: true },
    });
  }
}
