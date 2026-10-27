import "server-only";
import { unstable_cache } from "next/cache";
import type { PosColorFacet } from "../contracts/pos-catalog.schema";
import { isPosCatalogConfigured, listColors } from "../infrastructure/pos-catalog.client";
import { POS_COLORS_CACHE_TAG } from "./revalidate-catalog";

const POS_COLORS_REVALIDATE_SECONDS = 300;

// Los errores se lanzan dentro para que `unstable_cache` no guarde una respuesta fallida.
const cachedListColors = unstable_cache(() => listColors(), ["pos-colors"], {
  tags: [POS_COLORS_CACHE_TAG],
  revalidate: POS_COLORS_REVALIDATE_SECONDS,
});

/** Última respuesta válida del POS, en memoria del proceso (como el árbol de categorías). */
let lastKnownGood: PosColorFacet[] | null = null;

export type PosColorsSnapshot = {
  /** `null` = el POS no administra el catálogo (sin integración): los colores de Neon se muestran tal cual. */
  colors: PosColorFacet[] | null;
  /** `false` si el POS falló y no había copia previa (la paleta queda vacía). */
  available: boolean;
};

/**
 * Colores activos del POS. Si el POS falla sirve la última copia válida; sin copia, la paleta queda vacía
 * (la tienda no muestra colores que el POS no haya confirmado). Una respuesta OK vacía es la verdad del POS:
 * aún no hay colores creados y la tienda no muestra ninguno.
 */
export async function getPosColorsSnapshot(): Promise<PosColorsSnapshot> {
  if (!isPosCatalogConfigured()) return { colors: null, available: true };
  try {
    const fresh = await cachedListColors();
    lastKnownGood = fresh;
    return { colors: fresh, available: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    if (lastKnownGood) {
      console.error("[POS colors] Error consultando el POS. Sirviendo respaldo:", message);
      return { colors: lastKnownGood, available: true };
    }
    console.error("[POS colors] Error consultando el POS y no hay respaldo todavía:", message);
    return { colors: [], available: false };
  }
}

/** Colores activos del POS (o su respaldo); `[]` sin integración o sin respuesta. Nunca lanza. */
export async function getPosColors(): Promise<PosColorFacet[]> {
  return (await getPosColorsSnapshot()).colors ?? [];
}

/** Solo para tests: olvida el respaldo en memoria. */
export function resetPosColorsBackupForTests() {
  lastKnownGood = null;
}
