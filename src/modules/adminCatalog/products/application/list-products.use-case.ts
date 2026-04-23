import type { ProductListQueryDTO } from "../contracts/product-list.dto";
import { productListQuerySchema } from "../contracts/product-list.schema";
import { PrismaProductRepository } from "../infrastructure/prisma-product.repository";
import { ProductValidationError } from "./product.errors";

const productRepository = new PrismaProductRepository();

export async function listProductsUseCase(input: unknown) {
  const parsed = productListQuerySchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ProductValidationError(firstIssue?.message ?? "Parámetros inválidos");
  }

  const query: ProductListQueryDTO = {
    page: parsed.data.page,
    limit: parsed.data.limit,
  };

  return productRepository.listProducts(query);
}
