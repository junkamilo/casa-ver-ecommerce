// ─────────────────────────────────────────────────────────────────────────────
// Thin re-export del use case `getProductsByFlagUseCase`.
//
// La lógica vive ahora en `src/modules/collections/`. Este archivo se mantiene
// para preservar la API pública (`fetchCollectionProducts(where)`) consumida
// por `mas-vendidos` y `nueva-coleccion`.
//
// El mapper `transformProduct` también se re-exporta desde el dominio para
// cualquier consumidor externo que ya lo importara.
// ─────────────────────────────────────────────────────────────────────────────

import { getProductsByFlagUseCase } from "@/modules/collections/application/get-products-by-flag.use-case";
import type {
  CollectionProductsResultDTO,
  ProductWhereFilter,
} from "@/modules/collections/contracts/collection-product.dto";

export type { ProductWhereFilter } from "@/modules/collections/contracts/collection-product.dto";
export { transformProduct } from "@/modules/collections/domain/product-mapper.entity";

export async function fetchCollectionProducts(
  where: ProductWhereFilter,
): Promise<CollectionProductsResultDTO> {
  return getProductsByFlagUseCase(where);
}
