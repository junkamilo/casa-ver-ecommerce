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
} from "../domain/product-detail.entity";
import type { ProductDetailResultDTO } from "../contracts/product-detail.dto";
import { transformProduct } from "@/modules/collections/domain/product-mapper.entity";

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

/**
 * Orquesta el render del PDP. Devuelve `null` si el producto no existe o no
 * está activo (la page usa `notFound()` en ese caso).
 *
 * Internamente:
 *   1. Lee el producto con todos sus relaciones (variants, items, reviews,
 *      category.products para recomendados).
 *   2. Mapea a `UIProduct`/`UIProductItem`/`UIColor` para el cliente.
 *   3. Mapea los recomendados con `transformProduct` del módulo `collections`
 *      (mismo mapper que BestSellers/NewCollection — fix del bug histórico
 *      del 5to mapper duplicado).
 *   4. Lee y mapea social proof (compradores reales).
 *   5. Resuelve `initialItemId` desde `?tipo=`.
 */
export async function getProductDetailUseCase(
  input: GetProductDetailInput,
): Promise<ProductDetailResultDTO | null> {
  const product = await repository.getProductDetail(input.slug);
  if (!product) return null;

  const userId = input.userEmail
    ? await repository.getUserIdByEmail(input.userEmail)
    : null;

  const userReview = extractUserReview(product.reviews, userId);
  const { allGeneralImages, resolvedVideoUrl } = resolveGalleryAndVideo(product);
  const { liveRating, liveNumReviews } = computeReviewMetrics(product.reviews);

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

  const buyerOrders = await repository.getBuyerOrders(product.id);
  const socialProof = mapSocialProof(buyerOrders);

  const recommendedRaw = await repository.getRecommendedProducts(product.id, product.slug);
  const recommended = recommendedRaw.map(transformProduct);
  const reviews = mapProductReviews(product.reviews);

  return {
    product: uiProduct,
    recommended,
    existingReview: userReview,
    reviews,
    socialProof,
    initialItemId,
  };
}
