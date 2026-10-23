import { PrismaProductRepository } from "../infrastructure/prisma-product.repository";
import { ProductNotFoundError } from "./product.errors";
import { getPosCategoriesBySlug } from "@/modules/posIntegration/application/get-pos-product-categories.use-case";
import { normalizePosSlug } from "@/modules/posIntegration/domain/pos-mapper";

const productRepository = new PrismaProductRepository();

export async function getProductByIdUseCase(id: string) {
  const product = await productRepository.getProductByIdForAdmin(id);
  if (!product) {
    throw new ProductNotFoundError("Producto no encontrado");
  }
  // Categorías del POS (solo consulta): las de un producto de la web quedan vacías.
  const categoryNames = product.posSlug
    ? ((await getPosCategoriesBySlug([product.posSlug])).get(normalizePosSlug(product.posSlug)) ?? []).map(
        (c) => c.name,
      )
    : [];
  return { ...product, categoryNames };
}
