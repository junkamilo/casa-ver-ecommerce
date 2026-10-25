import { PrismaProductDetailRepository } from "../infrastructure/prisma-product-detail.repository";
import {
  computeReviewMetrics,
  computeTotalStock,
  extractUserReview,
  mapProductReviews,
  mapSocialProof,
  mapUIItems,
  mapUIProduct,
  resolveGalleryAndVideo,
  resolveInitialItemId,
  type RawProductDetail,
} from "../domain/product-detail.entity";
import { posToRawProductDetail } from "../domain/pos-product-detail.entity";
import type { ProductDetailResultDTO } from "../contracts/product-detail.dto";
import { transformProduct } from "@/modules/collections/domain/product-mapper.entity";
import { mapPosProduct } from "@/modules/posIntegration/domain/pos-mapper";
import { restrictToPosPalette } from "@/modules/posIntegration/domain/pos-color-palette";
import { getPosColorPalette } from "@/modules/posIntegration/application/get-pos-colors.use-case";
import { getRecommendedEntries } from "@/modules/catalog/listing/application/get-catalog";
import { toCard } from "@/modules/catalog/listing/domain/catalog-entry.entity";
import { resolveProductSource } from "./resolve-product-source";

const repository = new PrismaProductDetailRepository();

export interface GetProductDetailInput {
  slug: string;
  /** Query param `?tipo=` para abrir un item específico de un set. */
  tipo?: string;
  /**
   * Email del usuario autenticado (de la sesión NextAuth). El use case se
   * encarga de resolverlo a `userId` para extraer la reseña existente del
   * usuario sin pagar una query extra (la lee del array ya cargado).
   */
  userEmail: string | null;
}

/** Producto a pintar: del POS (+ capa web) o de Neon (productos de la web / POS sin respuesta). */
async function loadProduct(slug: string): Promise<RawProductDetail | null> {
  const resolved = await resolveProductSource(slug);
  if (!resolved) return null;

  if (resolved.source === "POS") {
    console.info(`[catalog] /product/${slug} source=POS`);
    return posToRawProductDetail(mapPosProduct(resolved.pos), resolved.overlay);
  }

  const legacy = await repository.getProductDetail(slug);
  if (!legacy) return null;
  console.info(`[catalog] /product/${slug} source=NEON_LEGACY`);
  // La identidad del producto en carrito, pedidos y reseñas es el slug también para los de la web.
  const product: RawProductDetail = { ...legacy, id: legacy.slug };
  // Producto creado en la web: solo los colores que existen en el POS (la web no tiene colores propios).
  const palette = legacy.posSlug ? null : await getPosColorPalette();
  if (!palette) return product;
  return {
    ...product,
    colors: restrictToPosPalette(product.colors, palette),
    items: (product.items ?? []).map((item) => ({ ...item, colors: restrictToPosPalette(item.colors, palette) })),
  };
}

/**
 * Orquesta el render del PDP. Devuelve `null` si el producto no existe o no
 * está activo (la page usa `notFound()` en ese caso).
 *
 * Internamente:
 *   1. Resuelve el producto: POS primero (cacheado por tag) o Neon para los
 *      productos de la web / si el POS no responde. Su `id` es el slug.
 *   2. Mapea a `UIProduct`/`UIProductItem`/`UIColor` para el cliente.
 *   3. Recomendados: productos del catálogo que comparten categoría, con
 *      `transformProduct` del módulo `collections`.
 *   4. Lee reseñas y social proof por slug.
 *   5. Resuelve `initialItemId` desde `?tipo=`.
 */
export async function getProductDetailUseCase(
  input: GetProductDetailInput,
): Promise<ProductDetailResultDTO | null> {
  const product = await loadProduct(input.slug);
  if (!product) return null;

  const [userId, productReviews, buyerOrders, recommended] = await Promise.all([
    input.userEmail ? repository.getUserIdByEmail(input.userEmail) : null,
    repository.getApprovedReviews(product.slug),
    repository.getBuyerOrders([product.slug]),
    getRecommendedEntries(product.slug),
  ]);

  const userReview = extractUserReview(productReviews, userId);
  const { allGeneralImages, resolvedVideoUrl } = resolveGalleryAndVideo(product);
  const { liveRating, liveNumReviews } = computeReviewMetrics(productReviews);

  const uiItems = mapUIItems(product.items ?? []);
  const initialItemId = resolveInitialItemId(
    product.isSet,
    uiItems,
    input.tipo,
  );
  const totalStock = computeTotalStock(product, uiItems);

  const uiProduct = mapUIProduct(
    product,
    uiItems,
    totalStock,
    liveRating,
    liveNumReviews,
    resolvedVideoUrl,
    allGeneralImages,
  );

  return {
    product: uiProduct,
    recommended: recommended.map((entry) => transformProduct(toCard(entry))),
    existingReview: userReview,
    reviews: mapProductReviews(productReviews),
    socialProof: mapSocialProof(buyerOrders),
    initialItemId,
  };
}
