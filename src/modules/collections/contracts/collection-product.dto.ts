import type { ProductStatus } from "@prisma/client";

// ── DTOs públicos del módulo collections ─────────────────────────────────────
//
// Re-exportamos los tipos UI compartidos (CollectionProduct, FilterOptions)
// para mantener una única fuente de verdad y evitar romper consumidores como
// `components/shared/ProductCollection/`, BestSellers, NewCollection, tienda.
//
// Los DTOs propios del dominio (CategoryListItemDTO, CategoryDetailDTO) viven
// aquí porque solo se usan a la salida del módulo.

export type {
  CollectionProduct,
  FilterOptions,
} from "@/components/shared/ProductCollection/types";

export interface CategoryListItemDTO {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  isActive: boolean;
}

export interface CategoryDetailDTO {
  name: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  image: string | null;
}

/**
 * Tipo consumido por el hook UI `useCollection`. Se hidrata desde
 * `GET /api/categories/[slug]` (ver `app/api/categories/[slug]/route.ts`).
 */
export interface CategoryData {
  name: string;
  description?: string | null;
  bannerImage?: string | null;
}

export type ProductWhereFilter =
  | { isFeatured: true; status: ProductStatus }
  | { isNew: true; status: ProductStatus };

export interface CollectionProductsResultDTO {
  products: import("@/components/shared/ProductCollection/types").CollectionProduct[];
  filterOptions: import("@/components/shared/ProductCollection/types").FilterOptions;
}

export interface NewProductsResultDTO {
  items: import("@/components/shared/ProductCollection/types").CollectionProduct[];
  hasMore: boolean;
}

export interface CategoryProductsResultDTO {
  category: { name: string } | null;
  garmentTypeName?: string;
  products: import("@/components/shared/ProductCollection/types").CollectionProduct[];
  filterOptions: import("@/components/shared/ProductCollection/types").FilterOptions;
}
