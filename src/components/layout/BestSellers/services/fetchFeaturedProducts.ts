// ─────────────────────────────────────────────────────────────────────────────
// Thin re-export del use case `getFeaturedProductsUseCase`.
//
// La lógica (query Prisma + mapper) vive ahora en `src/modules/collections/`.
// Este archivo se mantiene para preservar la API pública usada por
// `BestSellers/index.tsx` (consumida vía `unstable_cache`).
// ─────────────────────────────────────────────────────────────────────────────

import { getFeaturedProductsUseCase } from "@/modules/collections/application/get-featured-products.use-case";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";
import {
  transformProduct,
  type CollectionRawProduct,
} from "@/app/collections/utils/fetchCollectionProducts";

export async function fetchFeaturedProducts(): Promise<CollectionProduct[]> {
  return getFeaturedProductsUseCase();
}

