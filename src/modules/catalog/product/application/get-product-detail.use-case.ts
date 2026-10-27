import { PrismaProductDetailRepository } from "../infrastructure/prisma-product-detail.repository";
import {
  computeTotalStock,
  mapProductReviews,
  mapSocialProof,
  mapUIItems,
  mapUIProduct,
  resolveGalleryAndVideo,
  resolveInitialItemId,
  type RawProductDetail,
} from "../domain/product-detail.entity";
import { posToRawProductDetail } from "../domain/pos-product-detail.entity";
import type { ProductDetailResultDTO, SetComponentDTO } from "../contracts/product-detail.dto";
import { transformProduct } from "@/modules/collections/domain/product-mapper.entity";
import { mapPosProduct, normalizePosSlug } from "@/modules/posIntegration/domain/pos-mapper";
import { getRecommendedEntries } from "@/modules/catalog/listing/application/get-catalog";
import { toCard } from "@/modules/catalog/listing/domain/catalog-entry.entity";
import { resolveProductSource } from "./resolve-product-source";
import {
  fetchProductReviewsForRender,
  getOwnReview,
} from "@/modules/posIntegration/infrastructure/pos-reviews.client";
import type { PosProductReviews } from "@/modules/posIntegration/contracts/pos-reviews.schema";

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

/** Producto a pintar (del POS + capa web) y, si es un conjunto, sus piezas. */
async function loadProduct(
  slug: string,
): Promise<{ product: RawProductDetail; setComponents: SetComponentDTO[] } | null> {
  const resolved = await resolveProductSource(slug);
  if (!resolved) return null;
  return {
    product: posToRawProductDetail(mapPosProduct(resolved.pos), resolved.overlay),
    setComponents: [...resolved.pos.components]
      .sort((a, b) => a.position - b.position)
      .map((piece) => ({
        slug: piece.slug ? normalizePosSlug(piece.slug) : null,
        name: piece.name,
        position: piece.position,
        price: piece.salePrice,
        imageUrl: piece.coverImageUrl,
      })),
  };
}

/** Reseñas aprobadas del POS; si el POS no responde, la ficha se pinta sin reseñas. */
async function loadReviews(slug: string): Promise<PosProductReviews> {
  try {
    return await fetchProductReviewsForRender(slug);
  } catch (error) {
    console.warn(`[reviews] POS sin respuesta para ${slug}:`, error instanceof Error ? error.message : error);
    return { productSlug: slug, averageRating: null, totalReviews: 0, ratingDistribution: {}, reviews: [] };
  }
}

/** Reseña propia de la clienta (cualquier estado) para precargar el formulario. */
async function loadOwnReview(slug: string, email: string): Promise<{ rating: number; comment: string | null } | null> {
  try {
    const own = await getOwnReview(slug, email);
    return own ? { rating: own.rating, comment: own.comment || null } : null;
  } catch {
    return null;
  }
}

/**
 * Orquesta el render del PDP. Devuelve `null` si el producto no existe o no
 * está activo (la page usa `notFound()` en ese caso).
 *
 * Internamente:
 *   1. Resuelve el producto en el POS (cacheado por tag) + capa web. Su `id` es el slug.
 *   2. Mapea a `UIProduct`/`UIProductItem`/`UIColor` para el cliente.
 *   3. Recomendados: productos del catálogo que comparten categoría, con
 *      `transformProduct` del módulo `collections`.
 *   4. Reseñas aprobadas y promedio del POS (cacheado por tag), la reseña propia de la clienta (del POS)
 *      y social proof por slug.
 *   5. Resuelve `initialItemId` desde `?tipo=`.
 */
export async function getProductDetailUseCase(
  input: GetProductDetailInput,
): Promise<ProductDetailResultDTO | null> {
  const loaded = await loadProduct(input.slug);
  if (!loaded) return null;
  const { product, setComponents } = loaded;

  const [reviews, ownReview, buyerOrders, recommended] = await Promise.all([
    loadReviews(product.slug),
    input.userEmail ? loadOwnReview(product.slug, input.userEmail) : null,
    repository.getBuyerOrders([product.slug]),
    getRecommendedEntries(product.slug),
  ]);

  const { allGeneralImages, resolvedVideoUrl } = resolveGalleryAndVideo(product);
  const liveRating = reviews.averageRating ?? 0;
  const liveNumReviews = reviews.totalReviews;

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
    setComponents,
    recommended: recommended.map((entry) => transformProduct(toCard(entry))),
    existingReview: ownReview,
    reviews: mapProductReviews(reviews.reviews),
    socialProof: mapSocialProof(buyerOrders),
    initialItemId,
  };
}
