import type { ProductCreateInputDTO } from "../contracts/product-create.dto";
import { PrismaProductRepository } from "../infrastructure/prisma-product.repository";
import { ProductValidationError } from "./product.errors";
import {
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
  const categoryId = String(dto.categoryId).trim();
  const category = await productRepository.findCategoryById(categoryId);
  if (!category) {
    throw new ProductValidationError("La categoría seleccionada no existe");
  }
  if (!category.isActive) {
    throw new ProductValidationError(`La categoría "${category.name}" está inactiva`);
  }

  const resolvedGarmentTypeIds = parseGarmentTypeIds(body);
  if (resolvedGarmentTypeIds.length > 0) {
    const validCount = await productRepository.countValidGarmentTypesForCategory(
      resolvedGarmentTypeIds,
      category.id
    );
    if (validCount !== resolvedGarmentTypeIds.length) {
      throw new ProductValidationError(
        "Uno o más tipos de prenda no existen, están inactivos o no pertenecen a la categoría seleccionada"
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

  return productRepository.createProductWithRelations({
    dto,
    slug,
    categoryId,
    resolvedGarmentTypeIds,
    resolvedProductNewAt,
    resolvedOnSaleAt,
  });
}
