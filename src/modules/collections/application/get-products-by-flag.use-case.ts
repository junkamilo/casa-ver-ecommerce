import { PrismaCollectionRepository } from "../infrastructure/prisma-collection.repository";
import {
  transformProduct,
  buildFilterOptions,
} from "../domain/product-mapper.entity";
import type {
  CollectionProductsResultDTO,
  ProductWhereFilter,
} from "../contracts/collection-product.dto";

const repository = new PrismaCollectionRepository();

/**
 * Productos por flag booleano (`isFeatured` o `isNew`) más sus filterOptions.
 * Sirve a las páginas `/collections/mas-vendidos` y `/collections/nueva-coleccion`.
 *
 * No trae variants.stock — el badge "Agotado" no aplica en estas páginas
 * (mantiene paridad con el comportamiento previo de
 * `app/collections/utils/fetchCollectionProducts.ts`).
 */
export async function getProductsByFlagUseCase(
  where: ProductWhereFilter,
): Promise<CollectionProductsResultDTO> {
  const raw = await repository.findProductsByFlag(where);
  return {
    products: raw.map(transformProduct),
    filterOptions: buildFilterOptions(raw),
  };
}
