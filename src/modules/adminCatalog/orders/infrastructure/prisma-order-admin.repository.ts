import { prisma } from "@/lib/prisma";

export class PrismaOrderAdminRepository {
  async findOrderStatusByNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      select: { status: true, paymentMethod: true, transactionId: true, total: true },
    });
  }

  async updateOrderStatus(
    orderNumber: string,
    status: string,
    extraData: { shippedAt?: Date; deliveredAt?: Date; cancelledAt?: Date }
  ) {
    return prisma.order.update({
      where: { orderNumber },
      data: { status: status as never, ...extraData },
    });
  }

  async getCedulaRows() {
    return prisma.$queryRaw<
      {
        orderNumber: string;
        shippingCedula: string | null;
        userCedula: string | null;
      }[]
    >`
      SELECT o."orderNumber", o."shippingCedula", u."cedula" AS "userCedula"
      FROM "orders" o
      LEFT JOIN "users" u ON o."userId" = u."id"
    `;
  }

  async listOrdersForAdmin() {
    return prisma.order.findMany({
      include: {
        user: { select: { email: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
