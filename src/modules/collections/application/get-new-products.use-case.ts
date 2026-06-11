import { PrismaCollectionRepository } from "../infrastructure/prisma-collection.repository";
import { transformProduct } from "../domain/product-mapper.entity";
import type { NewProductsResultDTO } from "../contracts/collection-product.dto";

const repository = new PrismaCollectionRepository();

const DEFAULT_TAKE = 8;

/**
 * Nuevos productos (NewCollection en homepage).
 * Trae take + 1 filas para detectar `hasMore` sin un COUNT extra.
 */
export async function getNewProductsUseCase(
  take = DEFAULT_TAKE,
): Promise<NewProductsResultDTO> {
  const raw = await repository.findNewProducts(take);
  const hasMore = raw.length > take;
  const items = raw.slice(0, take).map(transformProduct);
  return { items, hasMore };
}
