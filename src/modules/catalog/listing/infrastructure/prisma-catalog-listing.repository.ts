import { prisma } from "@/lib/prisma";
import type { CatalogTaxonomy, NeonCatalogRow } from "../domain/catalog-entry.entity";

// Lo que el catálogo de lectura toma de Neon: los productos creados en la web (y, si el POS no responde,
// la copia de los del POS) y la taxonomía de la web (categorías por webId del POS, tipos de prenda).

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
  categories: { select: { category: { select: { slug: true, name: true, isActive: true } } } },
  garmentTypes: { select: { garmentType: { select: { slug: true, name: true } } } },
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

  async findTaxonomy(): Promise<CatalogTaxonomy> {
    const [categories, garmentTypes] = await Promise.all([
      prisma.category.findMany({
        where: { posWebId: { not: null }, isActive: true },
        select: { posWebId: true, slug: true, name: true },
      }),
      prisma.garmentType.findMany({ select: { slug: true, name: true } }),
    ]);
    return {
      categoryByWebId: new Map(categories.map((c) => [c.posWebId as string, { slug: c.slug, name: c.name }])),
      garmentTypeNameBySlug: new Map(garmentTypes.map((g) => [g.slug.toLowerCase(), g.name])),
    };
  }
}
