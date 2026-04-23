import { prisma } from "@/lib/prisma";

export class PrismaOrderFallbackRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async getPendingBoldOrders(thresholdMs: number, take: number = 50) {
    const cutoff = new Date(Date.now() - thresholdMs);
    
    return this.db.order.findMany({
      where: {
        status: "PENDING",
        paymentMethod: "BOLD",
        transactionId: { not: null },
        createdAt: { lt: cutoff },
      },
      select: {
        id: true,
        orderNumber: true,
        transactionId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
      take,
    });
  }

  async markOrderFailed(id: string) {
    return this.db.order.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "FAILED" },
    });
  }
}