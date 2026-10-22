import "server-only";
import { unstable_cache } from "next/cache";
import type { PosCategory } from "../contracts/pos-catalog.schema";
import { isPosCatalogConfigured, listCategories } from "../infrastructure/pos-catalog.client";
import { POS_CATEGORIES_CACHE_TAG } from "./revalidate-catalog";

const POS_CATEGORIES_REVALIDATE_SECONDS = 300;

// Los errores se lanzan dentro para que `unstable_cache` no guarde una respuesta fallida.
const cachedListCategories = unstable_cache(() => listCategories(), ["pos-category-tree"], {
  tags: [POS_CATEGORIES_CACHE_TAG],
  revalidate: POS_CATEGORIES_REVALIDATE_SECONDS,
});

/** Árbol de categorías publicado por el POS. Devuelve `[]` si el POS no está configurado o falla. */
export async function getPosCategoryTree(): Promise<PosCategory[]> {
  if (!isPosCatalogConfigured()) return [];
  try {
    return await cachedListCategories();
  } catch (error) {
    console.error("[POS categories] No se pudo consultar el POS:", error instanceof Error ? error.message : error);
    return [];
  }
}
