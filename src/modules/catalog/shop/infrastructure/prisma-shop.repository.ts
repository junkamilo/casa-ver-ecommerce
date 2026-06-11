import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { RawCollectionProduct } from "@/modules/collections/domain/product-mapper.entity";
import { TIENDA_PAGE_SIZE } from "../contracts/shop.dto";

// ── Select shape para tienda ──────────────────────────────────────────────────
//
// Optimización vs `STANDARD_SELECT` del módulo collections:
//   - `images.take = 2` (la card de tienda solo usa 1 principal + 1 hover).
//   - `items.colors.take = 1` y `images.take = 1` (solo se usa para fallback
//     cuando el set no tiene imágenes propias).
// Se trae `comparePrice` en items para que `transformProduct` calcule
// `oldPrice` correctamente para sets (paridad con /collections/*).
// NO se traen `variants` (tienda no muestra badge "Agotado").

const SHOP_SELECT = {
  name: true,
  slug: true,
  basePrice: true,
  comparePrice: true,
  isSet: true,
  isProductNew: true,
  isProductNewAt: true,
  isOnSale: true,
  images: {
    orderBy: { order: "asc" as const },
    take: 2,
    select: { url: true },
  },
  items: {
    orderBy: { order: "asc" as const },
    select: {
      price: true,
      comparePrice: true,
      colors: {
        take: 1,
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

interface ShopFilterOptionsRow {
  basePrice: unknown;
  colors: { name: string; hexCode: string }[];
}

export class PrismaShopRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  /**
   * Ejecuta en paralelo filterOptions + count; luego la página solicitada.
   */
  async getProductsForShop(
    where: Prisma.ProductWhereInput,
    requestedPage: number,
  ): Promise<{
    allForFilters: ShopFilterOptionsRow[];
    totalProducts: number;
    totalPages: number;
    page: number;
    raw: RawCollectionProduct[];
  }> {
    const [allForFilters, totalProducts] = await Promise.all([
      this.db.product.findMany({
        where: { status: "ACTIVE" },
        select: {
          basePrice: true,
          colors: { select: { name: true, hexCode: true } },
        },
      }),
      this.db.product.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalProducts / TIENDA_PAGE_SIZE));
    const page = Math.min(Math.max(1, requestedPage), totalPages);
    const skip = (page - 1) * TIENDA_PAGE_SIZE;

    const raw = await this.db.product.findMany({
      where,
      select: SHOP_SELECT,
      orderBy: { createdAt: "desc" },
      skip,
      take: TIENDA_PAGE_SIZE,
    });

    return { allForFilters, totalProducts, totalPages, page, raw };
  }
}
