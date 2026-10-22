import { getCatalog } from "@/modules/catalog/listing/application/get-catalog";
import { filterBySearch, toCard } from "@/modules/catalog/listing/domain/catalog-entry.entity";
import {
  transformProduct,
  buildFilterOptions,
} from "../domain/product-mapper.entity";
import type {
  CollectionProductsResultDTO,
  ProductWhereFilter,
} from "../contracts/collection-product.dto";

/**
 * Productos por flag booleano (`isFeatured` o `isNew`) más sus filterOptions.
 * Sirve a las páginas `/collections/mas-vendidos` y `/collections/nueva-coleccion`.
 * `isFeatured` viene de la etiqueta BEST_SELLER del POS; `isNew` es la bandera "Nueva colección" de la web.
 *
 * No trae variants.stock — el badge "Agotado" no aplica en estas páginas.
 */
export async function getProductsByFlagUseCase(
  where: ProductWhereFilter,
  q?: string,
): Promise<CollectionProductsResultDTO> {
  const flagged = (await getCatalog()).filter((entry) =>
    "isFeatured" in where ? entry.isFeatured : entry.isNew,
  );
  const cards = filterBySearch(flagged, q).map((entry) => toCard(entry));
  return {
    products: cards.map(transformProduct),
    filterOptions: buildFilterOptions(cards),
  };
}
