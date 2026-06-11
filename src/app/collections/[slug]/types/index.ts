// Re-exporta tipos compartidos desde la ubicación global
export type { CollectionProduct, FilterOptions } from "@/components/shared/ProductCollection/types";

// `CategoryData` se movió a `modules/collections/contracts/` junto con el hook
// `useCollection`. Se re-exporta aquí para no romper consumidores existentes.
export type { CategoryData } from "@/modules/collections/contracts/collection-product.dto";

// Filtros disponibles en la URL
export interface CollectionFilters {
  minPrice?: string;
  maxPrice?: string;
  color?: string;
}
