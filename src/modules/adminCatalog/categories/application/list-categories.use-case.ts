import { PrismaCategoryRepository } from "../infrastructure/prisma-category.repository";

const categoryRepository = new PrismaCategoryRepository();

export async function listCategoriesUseCase() {
  return categoryRepository.listCategories();
}
