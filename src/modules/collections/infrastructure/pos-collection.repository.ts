import "server-only";
import { getPosTaxonomy, getPosTaxonomySnapshot } from "@/modules/posIntegration/application/get-pos-taxonomy.use-case";
import { getPosCategoryTree } from "@/modules/posIntegration/application/get-pos-categories.use-case";
import { normalizeCollectionSlug, toPosCarouselItems } from "@/modules/posIntegration/domain/pos-category-view";
import type { CategoryDetailDTO, CategoryListItemDTO } from "../contracts/collection-product.dto";

/**
 * Colecciones de la tienda: categorías y subcategorías del POS (la web no guarda categorías).
 * Si el POS no responde se usa su última copia válida; sin ella → `null` / lista vacía.
 */
export class PosCollectionRepository {
  /** Categorías principales (la primera capa de `/collections` y el carrusel del home). */
  async listRootCategories(): Promise<CategoryListItemDTO[]> {
    return toPosCarouselItems(await getPosCategoryTree());
  }

  async getCategoryBasicBySlug(slug: string): Promise<{ name: string } | null> {
    const collection = (await getPosTaxonomy()).bySlug.get(normalizeCollectionSlug(slug));
    return collection ? { name: collection.name } : null;
  }

  /** `false` si el POS falló y no hay copia previa: un slug no encontrado no es un 404 real. */
  async isTaxonomyAvailable(): Promise<boolean> {
    return (await getPosTaxonomySnapshot()).available;
  }

  async getCategoryDetailBySlug(slug: string): Promise<CategoryDetailDTO | null> {
    const collection = (await getPosTaxonomy()).bySlug.get(normalizeCollectionSlug(slug));
    if (!collection) return null;
    return {
      name: collection.name,
      description: collection.description,
      metaTitle: collection.metaTitle,
      metaDescription: collection.metaDescription,
      image: collection.imageUrl,
    };
  }

  async getGarmentTypeBySlug(slug: string): Promise<{ slug: string; name: string } | null> {
    const type = (await getPosTaxonomy()).garmentTypes.get(normalizeCollectionSlug(slug));
    return type ? { slug: type.slug, name: type.name } : null;
  }
}
