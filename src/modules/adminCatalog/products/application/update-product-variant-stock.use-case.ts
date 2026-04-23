import type { ProductVariantStockDTO } from "../contracts/product-variant.dto";
import { updateProductVariantStockSchema } from "../contracts/product-variant.schema";
import { PrismaProductRepository } from "../infrastructure/prisma-product.repository";
import {
  ProductNotFoundError,
  ProductOwnershipError,
  ProductValidationError,
} from "./product.errors";

const productRepository = new PrismaProductRepository();

export async function updateProductVariantStockUseCase(input: {
  productId: string;
  variantId: string;
  body: unknown;
}): Promise<ProductVariantStockDTO> {
  const { productId, variantId, body } = input;
  const parsed = updateProductVariantStockSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ProductValidationError(firstIssue?.message ?? "Stock inválido");
  }

  const variant = await productRepository.findVariantById(variantId);
  if (!variant) {
    throw new ProductNotFoundError("Variante no encontrada");
  }

  if (variant.productId !== productId) {
    throw new ProductOwnershipError("Variante no pertenece a este producto");
  }

  const updated = await productRepository.updateVariantStock(variantId, parsed.data.stock);
  return {
    id: updated.id,
    colorName: updated.color.name,
    size: updated.size,
    stock: updated.stock,
    minStock: updated.minStock,
    sku: updated.sku,
    updatedAt: updated.updatedAt,
  };
}
