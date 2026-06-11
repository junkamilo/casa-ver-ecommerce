import { PrismaCollectionRepository } from "../infrastructure/prisma-collection.repository";
import type { CategoryDetailDTO } from "../contracts/collection-product.dto";

const repository = new PrismaCollectionRepository();

/**
 * Devuelve el detalle de una categoría activa por slug, o `null` si no existe.
 * Usado en `generateMetadata` de `app/collections/[slug]/page.tsx`.
 */
export async function getCategoryBySlugUseCase(
  slug: string,
): Promise<CategoryDetailDTO | null> {
  return repository.getCategoryDetailBySlug(slug);
}
