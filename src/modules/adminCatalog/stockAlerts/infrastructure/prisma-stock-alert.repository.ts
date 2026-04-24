import { prisma } from "@/lib/prisma";
import type { StockAlertsQueryDTO } from "../contracts/stock-alert.dto";

export class PrismaStockAlertRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async getActiveProductsWithColors(query: StockAlertsQueryDTO) {
    const skip = (query.page - 1) * query.limit;
    return this.db.product.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        colors: {
          select: {
            id: true,
            name: true,
            variants: { select: { stock: true } },
          },
        },
      },
      take: query.limit,
      skip,
      orderBy: { name: "asc" },
    });
  }

  async countActiveProducts(): Promise<number> {
    return this.db.product.count({ where: { status: "ACTIVE" } });
  }
}
