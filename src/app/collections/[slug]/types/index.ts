// Re-exporta tipos compartidos desde la ubicación global
export type { CollectionProduct, FilterOptions } from "@/components/shared/ProductCollection/types";

// Tipo exclusivo de la página de colección por slug
export interface CategoryData {
  name: string;
  description?: string | null;
  bannerImage?: string | null;
}

// Filtros disponibles en la URL
export interface CollectionFilters {
  minPrice?: string;
  maxPrice?: string;
  color?: string;
}
