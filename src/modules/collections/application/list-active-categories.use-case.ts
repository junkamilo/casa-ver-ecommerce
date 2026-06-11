import { PrismaCollectionRepository } from "../infrastructure/prisma-collection.repository";
import type { CategoryListItemDTO } from "../contracts/collection-product.dto";

const repository = new PrismaCollectionRepository();

export interface ListActiveCategoriesOptions {
  /**
   * Si es true, solo devuelve categorías raíz (parentId === null).
   * Usado por la página `/collections` que lista la primera capa.
   */
  rootOnly?: boolean;
}

export async function listActiveCategoriesUseCase(
  options?: ListActiveCategoriesOptions,
): Promise<CategoryListItemDTO[]> {
  return repository.listActiveCategories({ rootOnly: options?.rootOnly });
}
