import { PosCollectionRepository } from "../infrastructure/pos-collection.repository";
import type { CategoryDetailDTO } from "../contracts/collection-product.dto";

const repository = new PosCollectionRepository();

/**
 * Detalle de una colección (categoría o subcategoría del POS) por slug, o `null` si no existe.
 * Usado en `generateMetadata` de `app/collections/[slug]/page.tsx` y en `GET /api/categories/[slug]`.
 */
export async function getCategoryBySlugUseCase(
  slug: string,
): Promise<CategoryDetailDTO | null> {
  return repository.getCategoryDetailBySlug(slug);
}
