import type { ProductCreateInputDTO } from "../contracts/product-create.dto";
import { PrismaProductRepository } from "../infrastructure/prisma-product.repository";
import { ProductNotFoundError, ProductValidationError } from "./product.errors";
import {
  parseCategoryIds,
  parseGarmentTypeIds,
  parseSafeDate,
  validateProductCreateBody,
} from "./create-product.validation";
import { collectBodyAssetUrls } from "./product-assets";
import { deleteMediaAssetsByUrls } from "@/lib/media-admin";

const productRepository = new PrismaProductRepository();

export async function updateProductUseCase(input: { id: string; body: unknown }) {
  const { id, body } = input;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ProductValidationError("Cuerpo de solicitud inválido");
  }

  const payload = body as Record<string, unknown>;
  if (payload.active !== undefined && Object.keys(payload).length === 1) {
    if (typeof payload.active !== "boolean") {
      throw new ProductValidationError("Valor de estado inválido");
    }
    const updated = await productRepository.toggleProductStatus(id, payload.active);
    if (!updated) {
      throw new ProductNotFoundError("Producto no encontrado");
    }
    return updated;
  }

  const validationError = validateProductCreateBody(payload);
  if (validationError) {
    throw new ProductValidationError(validationError);
  }

  const dto = payload as ProductCreateInputDTO;
  const resolvedCategoryIds = parseCategoryIds(payload);
  const categories = await productRepository.findCategoriesByIds(resolvedCategoryIds);
  if (categories.length !== resolvedCategoryIds.length) {
    throw new ProductValidationError("Una o más categorías seleccionadas no existen");
  }
  const inactive = categories.find((category) => !category.isActive);
  if (inactive) {
    throw new ProductValidationError(`La categoría "${inactive.name}" está inactiva`);
  }

  const resolvedGarmentTypeIds = parseGarmentTypeIds(payload);
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

  const resolvedProductNewAt = dto.isProductNew
    ? (parseSafeDate(dto.isProductNewAt) ?? new Date())
    : null;
  const resolvedOnSaleAt = dto.isOnSale
    ? (parseSafeDate(dto.isOnSaleAt) ?? new Date())
    : null;
  const resolvedSuggestedAt = dto.isSuggested
    ? (parseSafeDate(dto.suggestedAt) ?? new Date())
    : null;

  const nextAssetUrls = collectBodyAssetUrls(payload);
  const { product, previousAssetUrls } = await productRepository.updateProductWithRelations({
    id,
    dto,
    resolvedCategoryIds,
    resolvedGarmentTypeIds,
    resolvedProductNewAt,
    resolvedOnSaleAt,
    resolvedSuggestedAt,
  });

  if (!product) {
    throw new ProductNotFoundError("Producto no encontrado");
  }

  const nextAssetSet = new Set(nextAssetUrls);
  const urlsToDelete = previousAssetUrls.filter((url) => !nextAssetSet.has(url));
  if (urlsToDelete.length > 0) {
    try {
      await deleteMediaAssetsByUrls(urlsToDelete);
    } catch (mediaError) {
      console.error("[PRODUCT_PATCH] Error limpiando archivos en Bunny", mediaError);
    }
  }

  return product;
}
