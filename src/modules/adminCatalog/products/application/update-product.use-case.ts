import type { ProductCreateInputDTO } from "../contracts/product-create.dto";
import { PrismaProductRepository } from "../infrastructure/prisma-product.repository";
import { ProductNotFoundError, ProductValidationError } from "./product.errors";
import {
  parseSafeDate,
  validateProductCreateBody,
} from "./create-product.validation";
import { collectBodyAssetUrls } from "./product-assets";
import { deleteMediaAssetsByUrls } from "@/lib/media-admin";
import { updatePosManagedProductUseCase } from "./update-pos-managed-product.use-case";

const productRepository = new PrismaProductRepository();

export async function updateProductUseCase(input: { id: string; body: unknown }) {
  const { id, body } = input;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ProductValidationError("Cuerpo de solicitud inválido");
  }

  const payload = body as Record<string, unknown>;

  const ownership = await productRepository.findPosOwnership(id);
  if (!ownership) {
    throw new ProductNotFoundError("Producto no encontrado");
  }
  if (ownership.posSlug) {
    return updatePosManagedProductUseCase(id, payload);
  }

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
