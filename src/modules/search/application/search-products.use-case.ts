import { PrismaSearchRepository } from "../infrastructure/prisma-search.repository";
import { pickFirstImageUrl, calculateMinimumPrice } from "../domain/search.entity";
import { RateLimitExceededError } from "./search.errors";
import type { ProductSearchResultDTO, SearchInputDTO } from "../contracts/search.dto";

// Se importan las utilidades de infraestructura de tu proyecto
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/ratelimit";

const searchRepository = new PrismaSearchRepository();
const MAX_RESULTS = 12;

export async function searchProductsUseCase(input: SearchInputDTO): Promise<ProductSearchResultDTO[]> {
  // 1. Control de Rate Limiting
  const rl = await rateLimit(`${input.ip}:search`, RATE_LIMIT_CONFIGS.search);
  
  if (!rl.success) {
    const retryAfter = rl.retryAfter ?? 60;
    throw new RateLimitExceededError(retryAfter, RATE_LIMIT_CONFIGS.search.limit);
  }

  // 2. Validación de entrada
  const q = input.query.trim();
  if (q.length < 2) {
    return [];
  }

  // 3. Consulta a base de datos
  const products = await searchRepository.searchActiveProducts(q, MAX_RESULTS);

  // 4. Transformación de datos (DTO de salida)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return products.map((p: any): ProductSearchResultDTO => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parentImage = pickFirstImageUrl(p.images.map((img: any) => img.url));
    const firstColorImage = pickFirstImageUrl(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      p.colors.flatMap((c: any) => c.images.map((img: any) => img.url))
    );
    const firstSetItemImage = pickFirstImageUrl(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      p.items.flatMap((item: any) => item.colors.flatMap((c: any) => c.images.map((img: any) => img.url)))
    );
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemPrices = p.items.map((item: any) => item.price);
    const resolvedPrice = calculateMinimumPrice(p.basePrice, itemPrices);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: resolvedPrice,
      image: parentImage ?? firstColorImage ?? firstSetItemImage ?? null,
    };
  });
}