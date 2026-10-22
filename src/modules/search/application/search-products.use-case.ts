import { getCatalog } from "@/modules/catalog/listing/application/get-catalog";
import { rankBySearch, toCard } from "@/modules/catalog/listing/domain/catalog-entry.entity";
import { transformProduct } from "@/modules/collections/domain/product-mapper.entity";
import { RateLimitExceededError } from "./search.errors";
import type { ProductSearchResultDTO, SearchInputDTO } from "../contracts/search.dto";

import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/ratelimit";

const MAX_RESULTS = 12;

/** Buscador del header: coincidencias por relevancia sobre el catálogo de la tienda (POS + web). */
export async function searchProductsUseCase(input: SearchInputDTO): Promise<ProductSearchResultDTO[]> {
  const rl = await rateLimit(`${input.ip}:search`, RATE_LIMIT_CONFIGS.search);

  if (!rl.success) {
    const retryAfter = rl.retryAfter ?? 60;
    throw new RateLimitExceededError(retryAfter, RATE_LIMIT_CONFIGS.search.limit);
  }

  const q = input.query.trim();
  if (q.length < 2) {
    return [];
  }

  return rankBySearch(await getCatalog(), q)
    .slice(0, MAX_RESULTS)
    .map((entry): ProductSearchResultDTO => {
      const card = transformProduct(toCard(entry));
      return {
        // El slug es la identidad del producto (igual en el POS y en la web).
        id: entry.slug,
        name: card.name,
        slug: card.slug,
        price: card.price,
        image: card.images[0] ?? card.colors?.find((c) => c.imageUrl)?.imageUrl ?? null,
      };
    });
}
