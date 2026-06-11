import { computeProductBadge } from "@/lib/productBadge";
import type {
  CollectionProduct,
  FilterOptions,
} from "@/components/shared/ProductCollection/types";

// ── Tipos crudos esperados del repositorio ───────────────────────────────────
//
// `variants` es opcional: solo se incluye en queries del Home (BestSellers /
// NewCollection) que necesitan calcular stock para el badge "Agotado". En
// queries de páginas de colección puede venir undefined.

type RawVariant = { stock: number };
type RawImage = { url: string };

type RawColor = {
  name: string;
  hexCode: string;
  images: RawImage[];
  variants?: RawVariant[];
};

type RawItemColor = {
  name: string;
  hexCode: string;
  images: RawImage[];
  variants?: RawVariant[];
};

type RawItem = {
  price: unknown;
  comparePrice?: unknown;
  colors: RawItemColor[];
};

export interface RawCollectionProduct {
  name: string;
  slug: string;
  basePrice: unknown;
  comparePrice: unknown;
  isSet: boolean;
  isProductNew: boolean;
  isProductNewAt: Date | null;
  isOnSale: boolean;
  images: RawImage[];
  items: RawItem[];
  colors: RawColor[];
}

// ── Mapper unificado ─────────────────────────────────────────────────────────
//
// Reemplaza las 4 implementaciones previas:
//   - app/collections/utils/fetchCollectionProducts.ts (transformProduct)
//   - app/collections/[slug]/page.tsx (getCollectionData inline mapper)
//   - components/layout/BestSellers/services/fetchFeaturedProducts.ts
//   - components/layout/NewCollection/mappers/productMapper.ts
//
// Diferencia clave: si las filas crudas traen `variants.stock`, calculamos
// `totalStock` para que `computeProductBadge` pueda devolver "Agotado".
// Si no, el badge se calcula sin stock (comportamiento de las páginas de
// colección que nunca traían variants).

function sumColorStock(c: { variants?: RawVariant[] }): number {
  if (!c.variants) return 0;
  return c.variants.reduce((s, v) => s + v.stock, 0);
}

function computeTotalStock(p: RawCollectionProduct): number | undefined {
  const hasVariants =
    p.colors.some((c) => c.variants !== undefined) ||
    p.items.some((it) => it.colors.some((c) => c.variants !== undefined));
  if (!hasVariants) return undefined;

  const parentStock = p.colors.reduce((acc, c) => acc + sumColorStock(c), 0);

  if (p.isSet && p.items.length > 0) {
    return p.items.reduce(
      (acc, item) =>
        acc + item.colors.reduce((s, c) => s + sumColorStock(c), 0),
      0,
    );
  }

  return parentStock;
}

export function transformProduct(p: RawCollectionProduct): CollectionProduct {
  const totalStock = computeTotalStock(p);

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
  const minPrice = itemPrices.length > 0 ? Math.min(...itemPrices) : undefined;

  // Para sets: oldPrice = comparePrice de la primera subcategoría (si existe).
  // Para productos normales: oldPrice = comparePrice del producto padre.
  const oldPrice = p.isSet
    ? p.items?.[0]?.comparePrice
      ? Number(p.items[0].comparePrice)
      : undefined
    : p.comparePrice
      ? Number(p.comparePrice)
      : undefined;

  // Para sets: si el padre no tiene colores, usar los de la primera subcategoría.
  const parentColors =
    p.colors.length > 0
      ? p.colors.map((c) => ({
          name: c.name,
          hexCode: c.hexCode,
          imageUrl: c.images[0]?.url ?? null,
        }))
      : undefined;

  const firstItemColors =
    p.isSet && !parentColors && (p.items?.[0]?.colors?.length ?? 0) > 0
      ? p.items[0].colors.map((c) => ({
          name: c.name,
          hexCode: c.hexCode,
          imageUrl: c.images[0]?.url ?? null,
        }))
      : undefined;

  return {
    images: cardImages,
    name: p.name,
    slug: p.slug,
    price: Number(p.basePrice),
    oldPrice,
    isSet: p.isSet || false,
    minPrice,
    badge: computeProductBadge({
      isProductNew: p.isProductNew,
      isProductNewAt: p.isProductNewAt,
      isOnSale: p.isOnSale,
      ...(totalStock !== undefined ? { stock: totalStock } : {}),
    }),
    colors: parentColors ?? firstItemColors,
  };
}

// ── FilterOptions ─────────────────────────────────────────────────────────────
//
// Construye el conjunto de colores y precio máximo para el panel de filtros
// a partir de la lista cruda de productos.

export function buildFilterOptions(raw: RawCollectionProduct[]): FilterOptions {
  const colorMap = new Map<string, string>();
  let maxPriceDb = 0;

  for (const p of raw) {
    const price = Number(p.basePrice);
    if (price > maxPriceDb) maxPriceDb = price;
    for (const c of p.colors) colorMap.set(c.hexCode, c.name);
  }

  const availableColors = Array.from(colorMap.entries()).map(
    ([hexCode, name]) => ({ hexCode, name }),
  );

  return { availableColors, maxPriceDb };
}
