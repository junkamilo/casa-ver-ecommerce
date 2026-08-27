import type {
  CollectionProduct,
  FilterOptions,
} from "@/components/shared/ProductCollection/types";

// ── Filtros admitidos en la URL de `/tienda` ─────────────────────────────────
//
// Los valores llegan como strings desde `searchParams`. El parser del use case
// los normaliza (trim, parseFloat, prefijo `#` para color hex).

export const TIENDA_PAGE_SIZE = 24;

export interface TiendaFilters {
  minPrice?: string;
  maxPrice?: string;
  color?: string;
  page?: string;
  q?: string;
}

export interface ShopProductsResultDTO {
  products: CollectionProduct[];
  filterOptions: FilterOptions;
  page: number;
  pageSize: number;
  totalProducts: number;
  totalPages: number;
}
