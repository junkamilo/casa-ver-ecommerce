import "server-only";
import { mapPosProduct, normalizePosSlug } from "../domain/pos-mapper";
import type { PosCollection } from "../domain/pos-category-view";
import { fetchProductForRender } from "../infrastructure/pos-catalog.read";
import { getPosTaxonomy } from "./get-pos-taxonomy.use-case";

/**
 * Colecciones del POS (categorías y subcategorías visibles) de cada producto, por slug. Lee el producto
 * y el árbol de la API del POS (Data Cache). Un producto que el POS no publica, o el POS sin responder,
 * queda sin categorías: la web no guarda categorías propias.
 */
export async function getPosCategoriesBySlug(slugs: string[]): Promise<Map<string, PosCollection[]>> {
  const result = new Map<string, PosCollection[]>();
  const unique = [...new Set(slugs.map(normalizePosSlug).filter(Boolean))];
  if (unique.length === 0) return result;

  const taxonomy = await getPosTaxonomy();
  await Promise.all(
    unique.map(async (slug) => {
      try {
        const pos = await fetchProductForRender(slug);
        if (!pos) return;
        const collections = mapPosProduct(pos)
          .categoryWebIds.map((webId) => taxonomy.byWebId.get(webId))
          .filter((c): c is PosCollection => Boolean(c));
        result.set(slug, collections);
      } catch (error) {
        console.warn(
          `[POS categorías] Sin respuesta del POS para ${slug}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }),
  );
  return result;
}
