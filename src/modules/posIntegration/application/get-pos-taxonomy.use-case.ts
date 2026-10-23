import "server-only";
import { cache } from "react";
import { buildPosTaxonomy, type PosTaxonomy } from "../domain/pos-category-view";
import { getPosCategoryTreeSnapshot } from "./get-pos-categories.use-case";

/**
 * Taxonomía de la tienda (categorías, subcategorías y tipos de prenda) leída del POS, o de su último respaldo
 * si el POS falla. `available: false` = el POS falló sin respaldo previo (la taxonomía viene vacía).
 * Memoizada por request.
 */
export const getPosTaxonomySnapshot = cache(async (): Promise<{ taxonomy: PosTaxonomy; available: boolean }> => {
  const { tree, available } = await getPosCategoryTreeSnapshot();
  return { taxonomy: buildPosTaxonomy(tree), available };
});

/** Taxonomía de la tienda; vacía sin POS configurado o si el POS falla sin respaldo. Memoizada por request. */
export const getPosTaxonomy = cache(async (): Promise<PosTaxonomy> => (await getPosTaxonomySnapshot()).taxonomy);
