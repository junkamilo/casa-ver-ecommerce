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

/**
 * Última respuesta válida del POS ("last known good"), en memoria del proceso: `next start` es de larga
 * vida, así que sobrevive entre peticiones y solo se pierde si el proceso se reinicia con el POS caído.
 * `null` = el POS aún no ha respondido bien desde que arrancó el proceso.
 */
let lastKnownGood: PosCategory[] | null = null;

export type PosCategoryTreeSnapshot = {
  tree: PosCategory[];
  /** `false` si el POS falló y no había copia previa: un slug ausente no prueba que la colección no exista. */
  available: boolean;
};

/**
 * Árbol de categorías publicado por el POS. Si el POS falla (caída, mantenimiento, 429/5xx) sirve la última
 * copia válida en vez de vaciar el menú y las colecciones. Una respuesta OK vacía sí es la verdad del POS
 * (no hay categorías creadas o se ocultaron todas) y reemplaza la copia.
 */
export async function getPosCategoryTreeSnapshot(): Promise<PosCategoryTreeSnapshot> {
  if (!isPosCatalogConfigured()) return { tree: [], available: true };
  try {
    const fresh = await cachedListCategories();
    lastKnownGood = fresh;
    return { tree: fresh, available: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    if (lastKnownGood) {
      console.error("[POS categories] Error consultando el POS. Sirviendo respaldo:", message);
      return { tree: lastKnownGood, available: true };
    }
    console.error("[POS categories] Error consultando el POS y no hay respaldo todavía:", message);
    return { tree: [], available: false };
  }
}

/** Árbol de categorías del POS (o su último respaldo). Nunca lanza. */
export async function getPosCategoryTree(): Promise<PosCategory[]> {
  return (await getPosCategoryTreeSnapshot()).tree;
}

/** Última copia válida en memoria, sin consultar al POS (p. ej. las URLs que tenía una categoría). */
export function getBackupCategoryTree(): PosCategory[] {
  return lastKnownGood ?? [];
}

/** Solo para tests: olvida el respaldo en memoria. */
export function resetPosCategoryBackupForTests() {
  lastKnownGood = null;
}
