import * as Sentry from "@sentry/nextjs";
import { getCatalog } from "@/modules/catalog/listing/application/get-catalog";
import { filterBySearch, toCard, type CatalogEntry } from "@/modules/catalog/listing/domain/catalog-entry.entity";
import { buildFilterOptions, transformProduct } from "@/modules/collections/domain/product-mapper.entity";
import {
  TIENDA_PAGE_SIZE,
  type ShopProductsResultDTO,
  type TiendaFilters,
} from "../contracts/shop.dto";

/** Filtros de precio y color de `/tienda` sobre el catálogo (antes, el `where` de Prisma). */
export function filterShopEntries(entries: CatalogEntry[], filters: TiendaFilters): CatalogEntry[] {
  const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : undefined;
  const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : undefined;
  const colorHex = filters.color ? `#${filters.color}`.toUpperCase() : null;

  return entries.filter((entry) => {
    const price = Number(entry.card.basePrice);
    if (minPrice !== undefined && !Number.isNaN(minPrice) && price < minPrice) return false;
    if (maxPrice !== undefined && !Number.isNaN(maxPrice) && price > maxPrice) return false;
    if (colorHex && !entry.card.colors.some((c) => c.hexCode.toUpperCase() === colorHex)) return false;
    return true;
  });
}

function parsePage(filters: TiendaFilters): number {
  return Math.max(1, parseInt(filters.page ?? "1", 10) || 1);
}

/**
 * Productos del catálogo `/tienda` con filtros opcionales y paginación (24/página).
 * Si la lectura falla, reporta a Sentry y relanza (error.tsx de tienda) — nunca grilla vacía.
 */
export async function getShopProductsUseCase(
  filters: TiendaFilters,
): Promise<ShopProductsResultDTO> {
  try {
    const catalog = await Sentry.startSpan({ name: "shop.getProducts", op: "db.shop" }, () => getCatalog());

    const matches = filterBySearch(filterShopEntries(catalog, filters), filters.q);
    const totalProducts = matches.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / TIENDA_PAGE_SIZE));
    const page = Math.min(parsePage(filters), totalPages);
    const pageEntries = matches.slice((page - 1) * TIENDA_PAGE_SIZE, page * TIENDA_PAGE_SIZE);

    return {
      products: pageEntries.map((entry) => transformProduct(toCard(entry))),
      // Opciones del panel de filtros: sobre todo el catálogo, no solo la página.
      filterOptions: buildFilterOptions(catalog.map((entry) => entry.card)),
      page,
      pageSize: TIENDA_PAGE_SIZE,
      totalProducts,
      totalPages,
    };
  } catch (err) {
    Sentry.withScope((scope) => {
      scope.setTag("flow", "shop-listing");
      scope.setExtra("filters", filters);
      Sentry.captureException(err);
    });
    throw err;
  }
}
