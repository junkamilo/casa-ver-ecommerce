import { PrismaCollectionRepository } from "../infrastructure/prisma-collection.repository";
import { getCatalog } from "@/modules/catalog/listing/application/get-catalog";
import { filterBySearch, toCard } from "@/modules/catalog/listing/domain/catalog-entry.entity";
import {
  transformProduct,
  buildFilterOptions,
} from "../domain/product-mapper.entity";
import type { CategoryProductsResultDTO } from "../contracts/collection-product.dto";

const repository = new PrismaCollectionRepository();

const EMPTY_RESULT: CategoryProductsResultDTO = {
  category: null,
  products: [],
  filterOptions: { availableColors: [], maxPriceDb: 0 },
};

/**
 * Productos de una categoría (con filtro opcional por garmentType slug y búsqueda `q`), sobre el catálogo
 * de la tienda (POS + productos de la web).
 *
 * Mantiene el contrato anterior: si la categoría no existe o falla la lectura,
 * devuelve el resultado vacío sin lanzar (la página renderiza un estado vacío).
 */
export async function getCollectionProductsUseCase(
  slug: string,
  garmentTypeSlug?: string,
  q?: string,
): Promise<CategoryProductsResultDTO> {
  try {
    const category = await repository.getCategoryBasicBySlug(slug);
    if (!category) return EMPTY_RESULT;

    // Un ?tipo= inexistente no filtra (como antes).
    let garmentTypeName: string | undefined;
    let tipo: string | undefined;
    if (garmentTypeSlug) {
      const gt = await repository.getGarmentTypeBySlug(garmentTypeSlug);
      garmentTypeName = gt?.name;
      if (gt) tipo = garmentTypeSlug.trim().toLowerCase();
    }

    const inCategory = (await getCatalog()).filter(
      (entry) => entry.categorySlugs.includes(slug) && (!tipo || entry.garmentTypeSlugs.includes(tipo)),
    );
    const cards = filterBySearch(inCategory, q).map((entry) => toCard(entry));

    return {
      category,
      garmentTypeName,
      products: cards.map(transformProduct),
      filterOptions: buildFilterOptions(cards),
    };
  } catch {
    return EMPTY_RESULT;
  }
}
