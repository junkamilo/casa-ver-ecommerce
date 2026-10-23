import type { ProductCreateInputDTO } from "../contracts/product-create.dto";
import { PrismaProductRepository } from "../infrastructure/prisma-product.repository";
import { ProductValidationError } from "./product.errors";
import {
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
    resolvedProductNewAt,
    resolvedOnSaleAt,
    resolvedSuggestedAt,
  });
}
