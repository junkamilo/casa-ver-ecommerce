import { PrismaCollectionRepository } from "../infrastructure/prisma-collection.repository";
import { PrismaSearchRepository } from "@/modules/search/infrastructure/prisma-search.repository";
import { isSearchQueryActive } from "@/modules/search/domain/search.entity";
import {
  transformProduct,
  buildFilterOptions,
} from "../domain/product-mapper.entity";
import type { CategoryProductsResultDTO } from "../contracts/collection-product.dto";
import type { Prisma } from "@prisma/client";

const repository = new PrismaCollectionRepository();
const searchRepository = new PrismaSearchRepository();

const EMPTY_RESULT: CategoryProductsResultDTO = {
  category: null,
  products: [],
  filterOptions: { availableColors: [], maxPriceDb: 0 },
};

/**
 * Productos de una categoría (con filtro opcional por garmentType slug).
 * Reemplaza la función `getCollectionData` que vivía inline en
 * `app/collections/[slug]/page.tsx`.
 *
 * Mantiene el contrato anterior: si la categoría no existe o falla la query,
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

    let garmentTypeId: string | undefined;
    let garmentTypeName: string | undefined;
    if (garmentTypeSlug) {
      const gt = await repository.getGarmentTypeBySlug(garmentTypeSlug);
      garmentTypeId = gt?.id;
      garmentTypeName = gt?.name;
    }

    let productIds: string[] | undefined;
    if (isSearchQueryActive(q)) {
      const extraWhere: Prisma.ProductWhereInput = {
        status: "ACTIVE",
        categories: {
          some: {
            category: { slug, isActive: true },
          },
        },
        ...(garmentTypeId
          ? { garmentTypes: { some: { garmentTypeId } } }
          : {}),
      };
      productIds = await searchRepository.searchActiveProductIds(
        q!.trim(),
        extraWhere,
      );
    }

    const raw = await repository.findProductsByCategory(
      slug,
      garmentTypeId,
      productIds,
    );

    return {
      category,
      garmentTypeName,
      products: raw.map(transformProduct),
      filterOptions: buildFilterOptions(raw),
    };
  } catch {
    return EMPTY_RESULT;
  }
}
