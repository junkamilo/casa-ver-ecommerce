import { prisma } from "@/lib/prisma";

export class PrismaSearchRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async searchActiveProducts(q: string, maxResults: number) {
    return this.db.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        images: {
          where: { url: { not: "" } },
          take: 8,
          select: { url: true },
          orderBy: [{ isCover: "desc" }, { order: "asc" }],
        },
        colors: {
          take: 6,
          select: {
            images: {
              where: { url: { not: "" } },
              take: 4,
              select: { url: true },
              orderBy: { order: "asc" },
            },
          },
        },
        items: {
          orderBy: { order: "asc" },
          select: {
            price: true,
            colors: {
              take: 1,
              select: {
                images: {
                  where: { url: { not: "" } },
                  take: 4,
                  select: { url: true },
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        },
      },
      take: maxResults,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });
  }
}