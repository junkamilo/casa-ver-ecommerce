import { PosCollectionRepository } from "../infrastructure/pos-collection.repository";
import { getCatalog } from "@/modules/catalog/listing/application/get-catalog";
import { filterBySearch, toCard } from "@/modules/catalog/listing/domain/catalog-entry.entity";
import {
  transformProduct,
  buildFilterOptions,
} from "../domain/product-mapper.entity";
import type { CategoryProductsResultDTO } from "../contracts/collection-product.dto";

const repository = new PosCollectionRepository();

const EMPTY_RESULT: CategoryProductsResultDTO = {
  category: null,
  products: [],
  filterOptions: { availableColors: [], maxPriceDb: 0 },
};

/**
 * Productos de una colección del POS (categoría o subcategoría, con filtro opcional por tipo de prenda y
 * búsqueda `q`) sobre el catálogo de la tienda.
 *
 * Mantiene el contrato anterior: nunca lanza y, sin datos, devuelve el resultado vacío (la página renderiza
 * un estado vacío). Si el POS cae se sirve su última copia válida de categorías (getPosCategoryTree) y el
 * catálogo cae a la copia de Neon (getCatalog); solo se registra como error lo que no es un 404 real.
 */
export async function getCollectionProductsUseCase(
  slug: string,
  garmentTypeSlug?: string,
  q?: string,
): Promise<CategoryProductsResultDTO> {
  try {
    const category = await repository.getCategoryBasicBySlug(slug);
    if (!category) {
      if (!(await repository.isTaxonomyAvailable())) {
        console.error(`[collections] POS sin respuesta y sin respaldo de categorías: /collections/${slug} queda vacía.`);
      }
      return EMPTY_RESULT;
    }

    // Un ?tipo= inexistente no filtra (como antes).
    let garmentTypeName: string | undefined;
    let tipo: string | undefined;
    if (garmentTypeSlug) {
      const gt = await repository.getGarmentTypeBySlug(garmentTypeSlug);
      garmentTypeName = gt?.name;
      if (gt) tipo = gt.slug;
    }

    const collectionSlug = slug.trim().toLowerCase();
    const inCategory = (await getCatalog()).filter(
      (entry) => entry.categorySlugs.includes(collectionSlug) && (!tipo || entry.garmentTypeSlugs.includes(tipo)),
    );
    const cards = filterBySearch(inCategory, q).map((entry) => toCard(entry));

    return {
      category,
      garmentTypeName,
      products: cards.map(transformProduct),
      filterOptions: buildFilterOptions(cards),
    };
  } catch (error) {
    console.error(
      `[collections] No se pudo armar /collections/${slug}:`,
      error instanceof Error ? error.message : error,
    );
    return EMPTY_RESULT;
  }
}
