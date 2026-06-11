import { PrismaProductRepository } from "../infrastructure/prisma-product.repository";
import { ProductNotFoundError } from "./product.errors";

const productRepository = new PrismaProductRepository();

export async function getProductByIdUseCase(id: string) {
  const product = await productRepository.getProductByIdForAdmin(id);
  if (!product) {
    throw new ProductNotFoundError("Producto no encontrado");
  }
  return product;
}
