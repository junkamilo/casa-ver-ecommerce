import type { DeleteCategoryInputDTO } from "../contracts/category.dto";
import { deleteCategoryInputSchema } from "../contracts/category.schema";
import { PrismaCategoryRepository } from "../infrastructure/prisma-category.repository";
import {
  CategoryConflictError,
  CategoryNotFoundError,
  CategoryValidationError,
} from "./category.errors";
import { deleteMediaAssetsByUrls } from "@/lib/media-admin";

const categoryRepository = new PrismaCategoryRepository();

export async function deleteCategoryUseCase(input: unknown) {
  const parsed = deleteCategoryInputSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new CategoryValidationError(firstIssue?.message ?? "Datos inválidos");
  }

  const dto: DeleteCategoryInputDTO = parsed.data;
  const category = await categoryRepository.findCategoryBaseById(dto.id);
  if (!category) {
    throw new CategoryNotFoundError("Categoría no encontrada");
  }

  const activeProductsCount = await categoryRepository.countActiveProductsByCategory(dto.id);
  if (activeProductsCount > 0) {
    throw new CategoryConflictError(
      "No se puede eliminar la categoría porque tiene productos activos relacionados.",
      {
        error: "has_active_products",
        count: activeProductsCount,
        name: category.name,
        message: "No se puede eliminar la categoría porque tiene productos activos relacionados.",
      }
    );
  }

  const { previousImage } = await categoryRepository.deleteCategoryWithRelations(dto.id);

  if (previousImage) {
    try {
      await deleteMediaAssetsByUrls([previousImage]);
    } catch (mediaError) {
      console.error("[CATEGORY_DELETE] Error limpiando archivos en Bunny", mediaError);
    }
  }

  return { success: true, id: dto.id, name: category.name };
}
