import { getCatalog } from "@/modules/catalog/listing/application/get-catalog";
import { toCard } from "@/modules/catalog/listing/domain/catalog-entry.entity";
import { transformProduct } from "../domain/product-mapper.entity";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";

const DEFAULT_TAKE = 12;

/**
 * Productos destacados (BestSellers en homepage).
 * Lleva variants.stock para que el badge "Agotado" funcione.
 */
export async function getFeaturedProductsUseCase(
  take = DEFAULT_TAKE,
): Promise<CollectionProduct[]> {
  return (await getCatalog())
    .filter((entry) => entry.isFeatured)
    .slice(0, take)
    .map((entry) => transformProduct(toCard(entry, true)));
}
