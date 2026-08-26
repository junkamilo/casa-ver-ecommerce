import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { RawCollectionProduct } from "../domain/product-mapper.entity";
import type {
  CategoryListItemDTO,
  CategoryDetailDTO,
  ProductWhereFilter,
} from "../contracts/collection-product.dto";

// ── Selects compartidos ──────────────────────────────────────────────────────
//
// `STANDARD_SELECT`  → páginas de colección (no necesita stock).
// `WITH_STOCK_SELECT` → BestSellers / NewCollection (badge "Agotado" depende
//                       de stock total acumulado).

const STANDARD_SELECT = {
  name: true,
  slug: true,
  basePrice: true,
  comparePrice: true,
  isNew: true,
  isFeatured: true,
  isSet: true,
  isProductNew: true,
  isProductNewAt: true,
  isOnSale: true,
  coverImageUrl: true,
  images: {
    orderBy: { order: "asc" as const },
    take: 8,
    select: { url: true },
  },
  items: {
    orderBy: { order: "asc" as const },
    select: {
      price: true,
      comparePrice: true,
      coverImageUrl: true,
      isCardFeatured: true,
      colors: {
        select: {
          name: true,
          hexCode: true,
          images: {
            orderBy: { order: "asc" as const },
            take: 8,
            select: { url: true },
          },
        },
      },
    },
  },
  colors: {
    select: {
      name: true,
      hexCode: true,
      images: {
        orderBy: { order: "asc" as const },
        take: 1,
        select: { url: true },
      },
    },
  },
} as const;

const WITH_STOCK_SELECT = {
  name: true,
  slug: true,
  basePrice: true,
  comparePrice: true,
  isSet: true,
  isProductNew: true,
  isProductNewAt: true,
  isOnSale: true,
  coverImageUrl: true,
  images: {
    orderBy: { order: "asc" as const },
    take: 8,
    select: { url: true },
  },
  items: {
    orderBy: { order: "asc" as const },
    select: {
      price: true,
      comparePrice: true,
      coverImageUrl: true,
      isCardFeatured: true,
      colors: {
        select: {
          name: true,
          hexCode: true,
          images: {
            orderBy: { order: "asc" as const },
            take: 8,
            select: { url: true },
          },
          variants: { select: { stock: true } },
        },
      },
    },
  },
  colors: {
    select: {
      name: true,
      hexCode: true,
      images: {
        orderBy: { order: "asc" as const },
        take: 1,
        select: { url: true },
      },
      variants: { select: { stock: true } },
    },
    orderBy: { id: "asc" as const },
  },
} as const;

export class PrismaCollectionRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  // ── Categories ─────────────────────────────────────────────────────────────

  /**
   * Lista categorías activas. Cuando `rootOnly` es true se filtra `parentId: null`
   * (usado por la página `/collections` que solo muestra categorías raíz).
   */
  async listActiveCategories(options?: {
    rootOnly?: boolean;
  }): Promise<CategoryListItemDTO[]> {
    return this.db.category.findMany({
      where: {
        isActive: true,
        ...(options?.rootOnly ? { parentId: null } : {}),
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        isActive: true,
      },
    });
  }

  async getCategoryBasicBySlug(slug: string): Promise<{ name: string } | null> {
    return this.db.category.findUnique({
      where: { slug, isActive: true },
      select: { name: true },
    });
  }

  async getCategoryDetailBySlug(slug: string): Promise<CategoryDetailDTO | null> {
    return this.db.category.findUnique({
      where: { slug, isActive: true },
      select: {
        name: true,
        description: true,
        metaTitle: true,
        metaDescription: true,
        image: true,
      },
    });
  }

  async getGarmentTypeBySlug(
    slug: string,
  ): Promise<{ id: string; name: string } | null> {
    return this.db.garmentType.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });
  }

  // ── Products ───────────────────────────────────────────────────────────────

  /**
   * Productos para `/collections/mas-vendidos` y `/collections/nueva-coleccion`.
   * No trae variants (no se necesita stock).
   */
  async findProductsByFlag(
    where: ProductWhereFilter,
  ): Promise<RawCollectionProduct[]> {
    return this.db.product.findMany({
      where,
      select: STANDARD_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Productos por categoría y, opcionalmente, garmentType. No trae variants.
   */
  async findProductsByCategory(
    categorySlug: string,
    garmentTypeId?: string,
  ): Promise<RawCollectionProduct[]> {
    const where: Prisma.ProductWhereInput = {
      categories: {
        some: {
          category: { slug: categorySlug, isActive: true },
        },
      },
      status: "ACTIVE",
      ...(garmentTypeId
        ? {
            garmentTypes: {
              some: { garmentTypeId },
            },
          }
        : {}),
    };

    return this.db.product.findMany({
      where,
      select: STANDARD_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Featured (BestSellers home). Trae variants.stock para badge "Agotado".
   * Limita a 12 productos por defecto.
   */
  async findFeaturedProducts(take = 12): Promise<RawCollectionProduct[]> {
    return this.db.product.findMany({
      where: { isFeatured: true, status: "ACTIVE" },
      select: WITH_STOCK_SELECT,
      orderBy: { createdAt: "desc" },
      take,
    });
  }

  /**
   * New (NewCollection home). Trae variants.stock para badge "Agotado".
   * Trae `take + 1` filas para detectar si hay más sin un COUNT extra.
   */
  async findNewProducts(take = 8): Promise<RawCollectionProduct[]> {
    return this.db.product.findMany({
      where: { isNew: true, status: "ACTIVE" },
      select: WITH_STOCK_SELECT,
      orderBy: { createdAt: "desc" },
      take: take + 1,
    });
  }
}
