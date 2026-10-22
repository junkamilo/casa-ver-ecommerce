import { getCatalog } from "@/modules/catalog/listing/application/get-catalog";
import { toCard } from "@/modules/catalog/listing/domain/catalog-entry.entity";
import { transformProduct } from "../domain/product-mapper.entity";
import type { NewProductsResultDTO } from "../contracts/collection-product.dto";

const DEFAULT_TAKE = 8;

/**
 * Nuevos productos (NewCollection en homepage): bandera "Nueva colección" de la web.
 * Lleva variants.stock para el badge "Agotado".
 */
export async function getNewProductsUseCase(
  take = DEFAULT_TAKE,
): Promise<NewProductsResultDTO> {
  const flagged = (await getCatalog()).filter((entry) => entry.isNew);
  return {
    items: flagged.slice(0, take).map((entry) => transformProduct(toCard(entry, true))),
    hasMore: flagged.length > take,
  };
}
