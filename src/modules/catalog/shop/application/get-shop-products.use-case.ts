import type { Prisma } from "@prisma/client";
import { PrismaShopRepository } from "../infrastructure/prisma-shop.repository";
import { transformProduct } from "@/modules/collections/domain/product-mapper.entity";
import type {
  ShopProductsResultDTO,
  TiendaFilters,
} from "../contracts/shop.dto";
import type { FilterOptions } from "@/components/shared/ProductCollection/types";

const repository = new PrismaShopRepository();

const EMPTY_RESULT: ShopProductsResultDTO = {
  products: [],
  filterOptions: { availableColors: [], maxPriceDb: 0 },
};

// ── Parser de filtros desde la URL ───────────────────────────────────────────
//
// Convierte los strings que llegan en `searchParams` a un `WhereInput` de
// Prisma. Tolerante a valores ausentes o inválidos.

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

/**
 * Productos del catálogo `/tienda` con filtros opcionales en la URL.
 * Equivalente al antiguo `getAllProducts(filters)` de
 * `app/tienda/services/index.ts`. Usa el mapper unificado del módulo
 * `collections` para `CollectionProduct`.
 *
 * Si la query falla, devuelve resultado vacío (la página renderiza estado
 * vacío en `CollectionClient`) — replica el comportamiento defensivo previo.
 */
export async function getShopProductsUseCase(
  filters: TiendaFilters,
): Promise<ShopProductsResultDTO> {
  try {
    const where = buildShopWhereFromFilters(filters);
    const { allForFilters, raw } = await repository.getProductsForShop(where);

    return {
      products: raw.map(transformProduct),
      filterOptions: buildFilterOptionsFromAll(allForFilters),
    };
  } catch {
    return EMPTY_RESULT;
  }
}
