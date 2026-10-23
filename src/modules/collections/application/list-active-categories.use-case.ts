import { PosCollectionRepository } from "../infrastructure/pos-collection.repository";
import type { CategoryListItemDTO } from "../contracts/collection-product.dto";

const repository = new PosCollectionRepository();

/** Categorías principales publicadas por el POS (página `/collections` y carrusel del home). */
export async function listActiveCategoriesUseCase(): Promise<CategoryListItemDTO[]> {
  return repository.listRootCategories();
}
