import { prisma } from "@/lib/prisma";
import {
  productMatchesSearch,
  scoreSearchRelevance,
  type SearchRelevanceFields,
} from "../domain/search.entity";

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  basePrice: true,
  coverImageUrl: true,
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
      coverImageUrl: true,
      isCardFeatured: true,
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

const CANDIDATE_SELECT = {
  id: true,
  name: true,
  description: true,
  slug: true,
  metaTitle: true,
  metaDescription: true,
  isFeatured: true,
  createdAt: true,
  garmentTypes: {
    select: {
      garmentType: { select: { name: true } },
    },
  },
  categories: {
    select: {
      category: { select: { name: true } },
    },
  },
  items: {
    select: { name: true },
  },
} as const;

type SearchCandidate = {
  id: string;
  name: string;
  description: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isFeatured: boolean;
  createdAt: Date;
  garmentTypes: { garmentType: { name: string } }[];
  categories: { category: { name: string } }[];
  items: { name: string }[];
};

export function buildSearchableText(product: SearchCandidate): string {
  const parts = [
    product.name,
    product.description,
    product.slug,
    product.metaTitle,
    product.metaDescription,
    ...product.garmentTypes.map((link) => link.garmentType.name),
    ...product.categories.map((link) => link.category.name),
    ...product.items.map((item) => item.name),
  ].filter(Boolean);

  return parts.join(" ");
}

function toRelevanceFields(product: SearchCandidate): SearchRelevanceFields {
  return {
    name: product.name,
    slug: product.slug,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    description: product.description,
    garmentTypeNames: product.garmentTypes.map((link) => link.garmentType.name),
    categoryNames: product.categories.map((link) => link.category.name),
    itemNames: product.items.map((item) => item.name),
  };
}

export class PrismaSearchRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async searchActiveProducts(q: string, maxResults: number) {
    const candidates: SearchCandidate[] = await this.db.product.findMany({
      where: { status: "ACTIVE" },
      select: CANDIDATE_SELECT,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    const ranked = candidates
      .filter((product) => productMatchesSearch(buildSearchableText(product), q))
      .map((product) => ({
        product,
        score: scoreSearchRelevance(toRelevanceFields(product), q),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.product.isFeatured !== b.product.isFeatured) {
          return a.product.isFeatured ? -1 : 1;
        }
        return b.product.createdAt.getTime() - a.product.createdAt.getTime();
      })
      .slice(0, maxResults);

    const matchedIds = ranked.map(({ product }) => product.id);

    if (matchedIds.length === 0) {
      return [];
    }

    const products = await this.db.product.findMany({
      where: { id: { in: matchedIds } },
      select: PRODUCT_SELECT,
    });

    const orderById = new Map<string, number>(
      matchedIds.map((id: string, index: number) => [id, index])
    );
    return products.sort(
      (a: { id: string }, b: { id: string }) =>
        (orderById.get(a.id) ?? 0) - (orderById.get(b.id) ?? 0)
    );
  }
}
