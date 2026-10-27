import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateProductListings } from "@/lib/revalidate-product-pages";
import { POS_PRODUCTS_CACHE_TAG, posProductCacheTag } from "../infrastructure/pos-catalog.read";
import { POS_REVIEWS_CACHE_TAG, posReviewsCacheTag } from "../infrastructure/pos-reviews.client";
import { POS_POPUPS_CACHE_TAG, posPopupsCacheTag } from "../infrastructure/pos-popups.client";
import { POS_HERO_CACHE_TAG } from "../infrastructure/pos-banners.client";

export const POS_CATEGORIES_CACHE_TAG = "pos-categories";
export const POS_COLORS_CACHE_TAG = "pos-colors";

export function revalidateCatalogPages(input: { productSlugs?: string[]; categorySlugs?: string[] } = {}) {
  try {
    revalidateProductListings();
    for (const slug of new Set(input.productSlugs ?? [])) revalidatePath(`/product/${slug}`);
    for (const slug of new Set(input.categorySlugs ?? [])) revalidatePath(`/collections/${slug}`);
  } catch (error) {
    console.warn("[POS sync] No se pudo revalidar la caché:", error instanceof Error ? error.message : error);
  }
}

/**
 * Expira la caché de `/api/pos-categories` y del header para que la próxima visita consulte al POS, y
 * además las páginas `/collections/<slug>` indicadas (las de la colección que cambió). Sin slugs, la
 * expiración del tag y de `/collections` cubre igual todo el árbol.
 */
export function revalidatePosCategories(collectionSlugs: string[] = []) {
  try {
    revalidateTag(POS_CATEGORIES_CACHE_TAG, { expire: 0 });
    revalidatePath("/collections");
    for (const slug of new Set(collectionSlugs)) revalidatePath(`/collections/${slug}`);
  } catch (error) {
    console.warn("[POS sync] No se pudo revalidar categorías:", error instanceof Error ? error.message : error);
  }
}

/**
 * Expira los colores del POS y las páginas que los usan: los listados (tarjetas y filtro por color) y las
 * fichas de producto. Los productos del POS que cambian llegan además con su propio aviso `product.upserted`.
 */
export function revalidatePosColors() {
  try {
    revalidateTag(POS_COLORS_CACHE_TAG, { expire: 0 });
    revalidateProductListings();
    revalidatePath("/product/[slug]", "page");
  } catch (error) {
    console.warn("[POS sync] No se pudo revalidar colores:", error instanceof Error ? error.message : error);
  }
}

/**
 * Expira las lecturas cacheadas del POS (`pos-catalog.read.ts`: el producto y el catálogo de los listados)
 * y las páginas que las muestran, para que el próximo render consulte al POS. No depende de la copia en Neon.
 */
export function revalidatePosProduct(posSlug: string) {
  try {
    revalidateTag(POS_PRODUCTS_CACHE_TAG, { expire: 0 });
    revalidateTag(posProductCacheTag(posSlug), { expire: 0 });
    revalidateProductListings();
    revalidatePath(`/product/${posSlug.trim().toLowerCase()}`);
  } catch (error) {
    console.warn("[POS sync] No se pudo revalidar el producto:", error instanceof Error ? error.message : error);
  }
}

/**
 * Expira las reseñas de un producto (ficha) y los testimonios del inicio cuando el POS aprueba, rechaza,
 * edita o borra una reseña publicada.
 */
export function revalidatePosReviews(productSlug: string) {
  try {
    revalidateTag(posReviewsCacheTag(productSlug), { expire: 0 });
    revalidateTag(POS_REVIEWS_CACHE_TAG, { expire: 0 });
    revalidatePath(`/product/${productSlug.trim().toLowerCase()}`);
    revalidatePath("/");
  } catch (error) {
    console.warn("[POS sync] No se pudo revalidar reseñas:", error instanceof Error ? error.message : error);
  }
}

/** Expira el popup vigente de una ubicación (y la ruta que lo entrega) cuando cambia en el POS. */
export function revalidatePosPopups(placement: string) {
  try {
    revalidateTag(posPopupsCacheTag(placement), { expire: 0 });
    revalidateTag(POS_POPUPS_CACHE_TAG, { expire: 0 });
    revalidatePath("/api/promo-popups/active");
  } catch (error) {
    console.warn("[POS sync] No se pudo revalidar popups:", error instanceof Error ? error.message : error);
  }
}

/** Expira el carrusel del inicio cuando cambian los banners o su duración en el POS. */
export function revalidatePosBanners() {
  try {
    revalidateTag(POS_HERO_CACHE_TAG, { expire: 0 });
    revalidatePath("/");
  } catch (error) {
    console.warn("[POS sync] No se pudo revalidar banners:", error instanceof Error ? error.message : error);
  }
}
