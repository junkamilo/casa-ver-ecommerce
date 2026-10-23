import { prisma } from "@/lib/prisma";
import type { NeonCatalogRow } from "../domain/catalog-entry.entity";

// Lo que el catálogo de lectura toma de Neon: los productos creados en la web (y, si el POS no responde,
// la copia de los del POS). Las categorías y los tipos de prenda ya no viven aquí: los publica el POS.

const IMAGES = (take: number) => ({
  orderBy: { order: "asc" as const },
  take,
  select: { url: true },
});

const CATALOG_SELECT = {
  name: true,
  slug: true,
  description: true,
  metaTitle: true,
  metaDescription: true,
  basePrice: true,
  comparePrice: true,
  isFeatured: true,
  isNew: true,
  isSuggested: true,
  suggestedAt: true,
  isSet: true,
  isProductNew: true,
  isProductNewAt: true,
  isOnSale: true,
  coverImageUrl: true,
  createdAt: true,
  images: IMAGES(8),
  items: {
    orderBy: { order: "asc" as const },
    select: {
      name: true,
      price: true,
      comparePrice: true,
      coverImageUrl: true,
      isCardFeatured: true,
      colors: {
        select: { name: true, hexCode: true, images: IMAGES(8), variants: { select: { stock: true } } },
      },
    },
  },
  colors: {
    orderBy: { id: "asc" as const },
    select: { name: true, hexCode: true, images: IMAGES(1), variants: { select: { stock: true } } },
  },
} as const;

export class PrismaCatalogListingRepository {
  /**
   * Productos activos de Neon. `onlyWeb`: solo los creados en la web (los del POS se leen del POS);
   * sin él, también la copia de los del POS (respaldo cuando el POS no responde).
   */
  async findActiveProducts(onlyWeb: boolean): Promise<NeonCatalogRow[]> {
    const rows = await prisma.product.findMany({
      where: { status: "ACTIVE", ...(onlyWeb ? { posSlug: null } : {}) },
      select: CATALOG_SELECT,
    });
    return rows as unknown as NeonCatalogRow[];
  }
}
