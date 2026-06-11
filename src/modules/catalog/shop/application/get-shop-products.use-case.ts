import type { Prisma } from "@prisma/client";
import { PrismaShopRepository } from "../infrastructure/prisma-shop.repository";
import { transformProduct } from "@/modules/collections/domain/product-mapper.entity";
import {
  TIENDA_PAGE_SIZE,
  type ShopProductsResultDTO,
  type TiendaFilters,
} from "../contracts/shop.dto";
import type { FilterOptions } from "@/components/shared/ProductCollection/types";

const repository = new PrismaShopRepository();

const EMPTY_RESULT: ShopProductsResultDTO = {
  products: [],
  filterOptions: { availableColors: [], maxPriceDb: 0 },
  page: 1,
  pageSize: TIENDA_PAGE_SIZE,
  totalProducts: 0,
  totalPages: 1,
};

function buildShopWhereFromFilters(
  filters: TiendaFilters,
): Prisma.ProductWhereInput {
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

  return where;
}

function buildFilterOptionsFromAll(
  rows: { basePrice: unknown; colors: { name: string; hexCode: string }[] }[],
): FilterOptions {
  const colorMap = new Map<string, string>();
  let maxPriceDb = 0;
  for (const p of rows) {
    const price = Number(p.basePrice);
    if (price > maxPriceDb) maxPriceDb = price;
    for (const c of p.colors) colorMap.set(c.hexCode, c.name);
  }
  const availableColors = Array.from(colorMap.entries()).map(
    ([hexCode, name]) => ({ hexCode, name }),
  );
  return { availableColors, maxPriceDb };
}

function parsePage(filters: TiendaFilters): number {
  return Math.max(1, parseInt(filters.page ?? "1", 10) || 1);
}

/**
 * Productos del catálogo `/tienda` con filtros opcionales y paginación (24/página).
 */
export async function getShopProductsUseCase(
  filters: TiendaFilters,
): Promise<ShopProductsResultDTO> {
  try {
    const where = buildShopWhereFromFilters(filters);
    const requestedPage = parsePage(filters);

    const { allForFilters, totalProducts, totalPages, page, raw } =
      await repository.getProductsForShop(where, requestedPage);

    return {
      products: raw.map(transformProduct),
      filterOptions: buildFilterOptionsFromAll(allForFilters),
      page,
      pageSize: TIENDA_PAGE_SIZE,
      totalProducts,
      totalPages,
    };
  } catch {
    return EMPTY_RESULT;
  }
}
