import { prisma } from "@/lib/prisma";
import { matchesSearchQuery, normalizeSearchText } from "../domain/search.entity";

const PRODUCT_SELECT = {
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
} as const;

export class PrismaSearchRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async searchActiveProducts(q: string, maxResults: number) {
    const normalizedQuery = normalizeSearchText(q);

    const candidates = await this.db.product.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        description: true,
        isFeatured: true,
        createdAt: true,
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    const matchedIds = candidates
      .filter(
        (product: { name: string; description: string }) =>
          matchesSearchQuery(product.name, normalizedQuery) ||
          matchesSearchQuery(product.description, normalizedQuery)
      )
      .slice(0, maxResults)
      .map((product: { id: string }) => product.id);

    if (matchedIds.length === 0) {
      return [];
    }

    const products = await this.db.product.findMany({
      where: { id: { in: matchedIds } },
      select: PRODUCT_SELECT,
    });

    const orderById = new Map(matchedIds.map((id: string, index: number) => [id, index]));
    return products.sort(
      (a: { id: string }, b: { id: string }) =>
        (orderById.get(a.id) ?? 0) - (orderById.get(b.id) ?? 0)
    );
  }
}