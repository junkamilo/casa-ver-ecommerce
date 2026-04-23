import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { computeProductBadge } from "@/lib/productBadge";
import type { CollectionProduct, FilterOptions } from "@/components/shared/ProductCollection/types";

// ── Shared Prisma select shape (tienda, colecciones, carruseles) ─────────────
export const COLLECTION_PRODUCT_GRID_SELECT = {
  name: true,
  slug: true,
  basePrice: true,
  comparePrice: true,
  isNew: true,
  isFeatured: true,
  isSet: true,
  isProductNew: true,
  isProductNewAt: true,
  isOnSale: true,
  images: {
    orderBy: { order: "asc" as const },
    take: 8,
    select: { url: true },
  },
  items: {
    orderBy: { order: "asc" as const },
    select: {
      price: true,
      comparePrice: true,
      colors: {
        select: {
          name: true,
          hexCode: true,
          images: {
            orderBy: { order: "asc" as const },
            take: 8,
            select: { url: true },
          },
        },
      },
    },
  },
  colors: {
    select: {
      name: true,
      hexCode: true,
      images: {
        orderBy: { order: "asc" as const },
        take: 1,
        select: { url: true },
      },
    },
  },
};

// ── Raw product type returned from Prisma ────────────────────────────────────
export type CollectionRawProduct = {
  name: string;
  slug: string;
  basePrice: unknown;
  comparePrice: unknown;
  isSet: boolean;
  isProductNew: boolean;
  isProductNewAt: Date | null;
  isOnSale: boolean;
  images: { url: string }[];
  items: { price: unknown; comparePrice: unknown; colors: { name: string; hexCode: string; images: { url: string }[] }[] }[];
  colors: { name: string; hexCode: string; images: { url: string }[] }[];
};

// ── Colores de conjunto: unir todos los ítems (dedupe por hex), no solo el primero
function mergeSetItemColors(
  items: CollectionRawProduct["items"]
): { name: string; hexCode: string; imageUrl?: string | null }[] {
  const seen = new Set<string>();
  const out: { name: string; hexCode: string; imageUrl?: string | null }[] = [];
  for (const it of items) {
    for (const c of it.colors ?? []) {
      const key = c.hexCode.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ name: c.name, hexCode: c.hexCode, imageUrl: c.images[0]?.url ?? null });
    }
  }
  return out;
}

// ── Transform a raw Prisma row → CollectionProduct ───────────────────────────
export function transformProduct(p: CollectionRawProduct): CollectionProduct {
  const baseNum = Number(p.basePrice);

  const parentImages = p.images.map((i) => i.url);
  const cardImages: string[] =
    parentImages.length > 0
      ? parentImages
      : p.isSet && (p.items?.[0]?.colors?.[0]?.images?.length ?? 0) > 0
        ? p.items[0].colors[0].images.map((i) => i.url)
        : [];

  const itemPrices: number[] =
    p.isSet && p.items?.length > 0
      ? p.items
          .map((it) => (it.price ? Number(it.price) : null))
          .filter((v): v is number => v !== null)
      : [];

  // "Desde $X" solo si hay al menos 2 ítems con precio y el rango varía (precios distintos).
  const minPrice =
    p.isSet && itemPrices.length >= 2
      ? (() => {
          const lo = Math.min(...itemPrices);
          const hi = Math.max(...itemPrices);
          return lo !== hi ? lo : undefined;
        })()
      : undefined;

  const allItemsSamePrice =
    p.isSet && itemPrices.length > 0 && itemPrices.every((v) => v === itemPrices[0]);
  const price =
    p.isSet && baseNum === 0 && allItemsSamePrice ? itemPrices[0]! : baseNum;

  // Sets: tachado del primer ítem con compare, o del producto padre (antes se ignoraba el padre).
  const oldPrice = p.isSet
    ? p.items?.[0]?.comparePrice
      ? Number(p.items[0].comparePrice)
      : p.comparePrice != null
        ? Number(p.comparePrice)
        : undefined
    : p.comparePrice != null
      ? Number(p.comparePrice)
      : undefined;

  const parentColors =
    p.colors.length > 0
      ? p.colors.map((c) => ({ name: c.name, hexCode: c.hexCode, imageUrl: c.images[0]?.url ?? null }))
      : undefined;
  const mergedItemColors =
    p.isSet && !parentColors && (p.items?.length ?? 0) > 0 ? mergeSetItemColors(p.items) : [];
  const itemColorsOnly = mergedItemColors.length > 0 ? mergedItemColors : undefined;

  return {
    images: cardImages,
    name: p.name,
    slug: p.slug,
    price,
    oldPrice,
    isSet: p.isSet || false,
    minPrice,
    badge: computeProductBadge({
      isProductNew: p.isProductNew,
      isProductNewAt: p.isProductNewAt,
      isOnSale: p.isOnSale,
    }),
    colors: parentColors ?? itemColorsOnly,
  };
}

// ── Build FilterOptions from a list of raw products ──────────────────────────
function buildFilterOptions(raw: CollectionRawProduct[]): FilterOptions {
  const colorMap = new Map<string, string>();
  let maxPriceDb = 0;

  for (const p of raw) {
    const price = Number(p.basePrice);
    if (price > maxPriceDb) maxPriceDb = price;
    for (const c of p.colors) colorMap.set(c.hexCode, c.name);
  }

  const availableColors = Array.from(colorMap.entries()).map(([hexCode, name]) => ({
    hexCode,
    name,
  }));

  return { availableColors, maxPriceDb };
}

// ── Public fetch function ─────────────────────────────────────────────────────
export type ProductWhereFilter =
  | { isFeatured: true; status: ProductStatus }
  | { isNew: true; status: ProductStatus };

export async function fetchCollectionProducts(where: ProductWhereFilter): Promise<{
  products: CollectionProduct[];
  filterOptions: FilterOptions;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: CollectionRawProduct[] = await (prisma as any).product.findMany({
    where,
    select: COLLECTION_PRODUCT_GRID_SELECT,
    orderBy: { createdAt: "desc" },
  });

  const products = raw.map(transformProduct);
  const filterOptions = buildFilterOptions(raw);

  return { products, filterOptions };
}
