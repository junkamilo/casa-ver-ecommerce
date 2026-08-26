import { PrismaSearchRepository } from "../infrastructure/prisma-search.repository";
import { pickFirstImageUrl, calculateMinimumPrice } from "../domain/search.entity";
import { RateLimitExceededError } from "./search.errors";
import type { ProductSearchResultDTO, SearchInputDTO } from "../contracts/search.dto";

import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/ratelimit";

const searchRepository = new PrismaSearchRepository();
const MAX_RESULTS = 12;

type SearchImage = { url: string };
type SearchColor = { images: SearchImage[] };
type SearchItem = {
  price: unknown;
  coverImageUrl?: string | null;
  isCardFeatured?: boolean;
  colors: SearchColor[];
};
type SearchProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: unknown;
  coverImageUrl?: string | null;
  images: SearchImage[];
  colors: SearchColor[];
  items: SearchItem[];
};

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

  const products = (await searchRepository.searchActiveProducts(
    q,
    MAX_RESULTS,
  )) as SearchProduct[];

  return products.map((p): ProductSearchResultDTO => {
    const productCover =
      typeof p.coverImageUrl === "string" && p.coverImageUrl.trim()
        ? p.coverImageUrl.trim()
        : null;
    const featuredItem =
      p.items.find((item) => item.isCardFeatured) ?? p.items[0] ?? null;
    const parentImage = pickFirstImageUrl(p.images.map((img) => img.url));
    const firstColorImage = pickFirstImageUrl(
      p.colors.flatMap((c) => c.images.map((img) => img.url)),
    );
    const featuredCover =
      typeof featuredItem?.coverImageUrl === "string" && featuredItem.coverImageUrl.trim()
        ? featuredItem.coverImageUrl.trim()
        : null;
    const featuredItemImage = pickFirstImageUrl(
      (featuredItem?.colors ?? []).flatMap((c) => c.images.map((img) => img.url)),
    );

    const featuredPrice =
      featuredItem?.price != null ? Number(featuredItem.price) : null;
    const resolvedPrice =
      featuredPrice != null && !Number.isNaN(featuredPrice) && featuredPrice > 0
        ? featuredPrice
        : calculateMinimumPrice(Number(p.basePrice), []);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: resolvedPrice,
      image:
        productCover ??
        parentImage ??
        firstColorImage ??
        featuredCover ??
        featuredItemImage ??
        null,
    };
  });
}
