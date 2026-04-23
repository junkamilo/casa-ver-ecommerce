import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { CollectionProduct, FilterOptions } from "@/components/shared/ProductCollection/types";
import type { TiendaFilters } from "../types";
import {
  COLLECTION_PRODUCT_GRID_SELECT,
  transformProduct,
  type CollectionRawProduct,
} from "@/app/collections/utils/fetchCollectionProducts";

/** Misma forma que la grilla global, con menos imágenes por fila en listado tienda. */
const TIENDA_PRODUCT_SELECT = {
  ...COLLECTION_PRODUCT_GRID_SELECT,
  images: {
    orderBy: { order: "asc" as const },
    take: 2,
    select: { url: true },
  },
};

const TIENDA_PAGE_SIZE = 24;

export async function getAllProducts(filters: TiendaFilters): Promise<{
  products: CollectionProduct[];
  filterOptions: FilterOptions;
  page: number;
  pageSize: number;
  totalProducts: number;
  totalPages: number;
}> {
  try {
    const where: Prisma.ProductWhereInput = { status: "ACTIVE" };

    const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : undefined;
    const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : undefined;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }

    if (filters.color) {
      where.colors = { some: { hexCode: `#${filters.color}` } };
    }

    const parsedPage = Math.max(1, parseInt(filters.page ?? "1", 10) || 1);

    const [allForFilters, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: {
          basePrice: true,
          colors: { select: { name: true, hexCode: true } },
        },
      }),

      prisma.product.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalProducts / TIENDA_PAGE_SIZE));
    const page = Math.min(parsedPage, totalPages);
    const skip = (page - 1) * TIENDA_PAGE_SIZE;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await (prisma as any).product.findMany({
      where,
      select: TIENDA_PRODUCT_SELECT,
      orderBy: { createdAt: "desc" },
      skip,
      take: TIENDA_PAGE_SIZE,
    });

    const colorMap = new Map<string, string>();
    let maxPriceDb = 0;
    for (const p of allForFilters) {
      const price = Number(p.basePrice);
      if (price > maxPriceDb) maxPriceDb = price;
      for (const c of p.colors) colorMap.set(c.hexCode, c.name);
    }
    const availableColors = Array.from(colorMap.entries()).map(([hexCode, name]) => ({ hexCode, name }));

    const products = (raw as CollectionRawProduct[]).map(transformProduct);

    return {
      products,
      filterOptions: { availableColors, maxPriceDb },
      page,
      pageSize: TIENDA_PAGE_SIZE,
      totalProducts,
      totalPages,
    };
  } catch {
    return {
      products: [],
      filterOptions: { availableColors: [], maxPriceDb: 0 },
      page: 1,
      pageSize: TIENDA_PAGE_SIZE,
      totalProducts: 0,
      totalPages: 1,
    };
  }
}
