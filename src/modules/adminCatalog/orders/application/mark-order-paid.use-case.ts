import { prisma } from "@/lib/prisma";

export async function markOrderPaidUseCase(transactionId: string, paymentId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { transactionId },
      include: { items: true, user: true },
    });

    if (!order) throw new Error(`Orden no encontrada: ${transactionId}`);
    if (order.status === "PAID") return order;

    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID", paymentId, paidAt: new Date() },
      include: { items: true, user: true },
    });

    for (const item of order.items) {
      const productVariant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        select: { id: true },
      });

      if (productVariant) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
            reserved: { decrement: item.quantity },
          },
        });
      }
    }

    await tx.adminNotification.create({
      data: {
        orderId: updatedOrder.id,
        title: `Pedido pagado · ${updatedOrder.orderNumber}`,
        body: `${updatedOrder.user?.name ?? "Cliente"} · ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(updatedOrder.total))}`,
      },
    });

    return updatedOrder;
  });
}
