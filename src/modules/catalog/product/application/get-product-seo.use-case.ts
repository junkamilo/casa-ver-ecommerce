import { PrismaProductDetailRepository } from "../infrastructure/prisma-product-detail.repository";
import type { ProductSeoDTO } from "../contracts/product-detail.dto";
import { posProductSeo } from "../domain/pos-product-detail.entity";
import { mapPosProduct } from "@/modules/posIntegration/domain/pos-mapper";
import { resolveProductSource } from "./resolve-product-source";

const repository = new PrismaProductDetailRepository();

/**
 * Devuelve los campos mínimos de un producto activo para construir
 * `<head>` (`generateMetadata`). Si el producto no existe o no está activo,
 * devuelve `null` y la página renderiza `{ title: "Producto no encontrado" }`.
 * Productos del POS: contenido del POS + SEO puesto en la web (misma lectura
 * cacheada que el PDP, así que no hay una segunda llamada al POS).
 */
export async function getProductSeoUseCase(
  slug: string,
): Promise<ProductSeoDTO | null> {
  const resolved = await resolveProductSource(slug);
  if (!resolved) return null;
  if (resolved.source === "POS") return posProductSeo(mapPosProduct(resolved.pos), resolved.overlay);

  const product = await repository.getProductForSeo(slug);
  if (!product) return null;
  return {
    name: product.name,
    description: product.description,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    firstImageUrl:
      (typeof product.coverImageUrl === "string" && product.coverImageUrl.trim()
        ? product.coverImageUrl.trim()
        : null) ??
      product.images[0]?.url ??
      null,
  };
}
