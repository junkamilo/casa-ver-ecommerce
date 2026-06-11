import { PrismaCollectionRepository } from "../infrastructure/prisma-collection.repository";
import { transformProduct } from "../domain/product-mapper.entity";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";

const repository = new PrismaCollectionRepository();

const DEFAULT_TAKE = 12;

/**
 * Productos destacados (BestSellers en homepage).
 * Trae variants.stock para que el badge "Agotado" funcione.
 */
export async function getFeaturedProductsUseCase(
  take = DEFAULT_TAKE,
): Promise<CollectionProduct[]> {
  const raw = await repository.findFeaturedProducts(take);
  return raw.map(transformProduct);
}
