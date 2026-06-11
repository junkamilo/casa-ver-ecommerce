import { PrismaProductDetailRepository } from "../infrastructure/prisma-product-detail.repository";
import type { ProductSeoDTO } from "../contracts/product-detail.dto";

const repository = new PrismaProductDetailRepository();

/**
 * Devuelve los campos mínimos de un producto activo para construir
 * `<head>` (`generateMetadata`). Si el producto no existe o no está activo,
 * devuelve `null` y la página renderiza `{ title: "Producto no encontrado" }`.
 */
export async function getProductSeoUseCase(
  slug: string,
): Promise<ProductSeoDTO | null> {
  const product = await repository.getProductForSeo(slug);
  if (!product) return null;
  return {
    name: product.name,
    description: product.description,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    firstImageUrl: product.images[0]?.url ?? null,
  };
}
