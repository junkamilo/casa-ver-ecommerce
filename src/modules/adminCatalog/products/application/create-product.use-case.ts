import type { ProductCreateInputDTO } from "../contracts/product-create.dto";
import { PrismaProductRepository } from "../infrastructure/prisma-product.repository";
import { ProductValidationError } from "./product.errors";
import {
  parseCategoryIds,
  parseGarmentTypeIds,
  parseSafeDate,
  validateProductCreateBody,
} from "./create-product.validation";

const productRepository = new PrismaProductRepository();

export async function createProductUseCase(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ProductValidationError("Cuerpo de solicitud inválido");
  }

  const body = input as Record<string, unknown>;
  const validationError = validateProductCreateBody(body);
  if (validationError) {
    throw new ProductValidationError(validationError);
  }

  const dto = body as ProductCreateInputDTO;
  const resolvedCategoryIds = parseCategoryIds(body);
  const categories = await productRepository.findCategoriesByIds(resolvedCategoryIds);
  if (categories.length !== resolvedCategoryIds.length) {
    throw new ProductValidationError("Una o más categorías seleccionadas no existen");
  }
  const inactive = categories.find((category) => !category.isActive);
  if (inactive) {
    throw new ProductValidationError(`La categoría "${inactive.name}" está inactiva`);
  }

  const resolvedGarmentTypeIds = parseGarmentTypeIds(body);
  if (resolvedGarmentTypeIds.length > 0) {
    const validCount = await productRepository.countValidGarmentTypesForCategories(
      resolvedGarmentTypeIds,
      resolvedCategoryIds
    );
    if (validCount !== resolvedGarmentTypeIds.length) {
      throw new ProductValidationError(
        "Uno o más tipos de prenda no existen, están inactivos o no pertenecen a las categorías seleccionadas"
      );
    }
  }

  const slug = `${String(dto.name).toLowerCase().trim().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "")}-${Date.now()}`;
  const resolvedProductNewAt = dto.isProductNew
    ? (parseSafeDate(dto.isProductNewAt) ?? new Date())
    : null;
  const resolvedOnSaleAt = dto.isOnSale
    ? (parseSafeDate(dto.isOnSaleAt) ?? new Date())
    : null;
  const resolvedSuggestedAt = dto.isSuggested
    ? (parseSafeDate(dto.suggestedAt) ?? new Date())
    : null;

  return productRepository.createProductWithRelations({
    dto,
    slug,
    resolvedCategoryIds,
    resolvedGarmentTypeIds,
    resolvedProductNewAt,
    resolvedOnSaleAt,
    resolvedSuggestedAt,
  });
}
