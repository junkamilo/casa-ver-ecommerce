// ─────────────────────────────────────────────────────────────────────────────
// Thin re-export del use case `getNewProductsUseCase`.
//
// La lógica (query Prisma + mapper) vive ahora en `src/modules/collections/`.
// Este archivo se mantiene para preservar la API pública usada por
// `NewCollection/index.tsx` (consumida vía `unstable_cache`).
// ─────────────────────────────────────────────────────────────────────────────

import { getNewProductsUseCase } from "@/modules/collections/application/get-new-products.use-case";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";

export async function fetchNewProducts(): Promise<{
  items: CollectionProduct[];
  hasMore: boolean;
}> {
  return getNewProductsUseCase();
}
