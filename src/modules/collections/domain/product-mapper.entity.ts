import { computeProductBadge } from "@/lib/productBadge";
import { getColorCoverUrl } from "@/modules/catalog/product/domain/video-url.entity";
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
  coverImageUrl?: string | null;
  isCardFeatured?: boolean;
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
  coverImageUrl?: string | null;
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

  const featuredItem =
    p.isSet && p.items.length > 0
      ? (p.items.find((item) => item.isCardFeatured) ?? p.items[0])
      : null;

  const coverImageUrl =
    (typeof p.coverImageUrl === "string" && p.coverImageUrl.trim()) ||
    (featuredItem && typeof featuredItem.coverImageUrl === "string"
      ? featuredItem.coverImageUrl.trim()
      : "") ||
    null;

  const parentImages = p.images.map((i) => i.url);
  const fallbackImages: string[] =
    parentImages.length > 0
      ? parentImages
      : featuredItem && (featuredItem.colors?.[0]?.images?.length ?? 0) > 0
        ? featuredItem.colors[0].images.map((i) => i.url)
        : [];

  const cardImages: string[] = coverImageUrl
    ? [coverImageUrl, ...fallbackImages.filter((url) => url !== coverImageUrl)]
    : fallbackImages;

  // Para sets: precio de la pieza representante (sin "Desde"/minPrice).
  const featuredPrice =
    featuredItem?.price != null ? Number(featuredItem.price) : null;

  // Para sets: oldPrice = comparePrice de la pieza representante.
  // Para productos normales: oldPrice = comparePrice del producto padre.
  const oldPrice = p.isSet
    ? featuredItem?.comparePrice
      ? Number(featuredItem.comparePrice)
      : undefined
    : p.comparePrice
      ? Number(p.comparePrice)
      : undefined;

  // Para sets: si el padre no tiene colores, usar los de la pieza representante.
  const parentColors =
    p.colors.length > 0
      ? p.colors.map((c) => {
          const urls = c.images.map((i) => i.url);
          return {
            name: c.name,
            hexCode: c.hexCode,
            imageUrl: getColorCoverUrl(urls),
          };
        })
      : undefined;

  const featuredItemColors =
    p.isSet && !parentColors && (featuredItem?.colors?.length ?? 0) > 0
      ? featuredItem!.colors.map((c) => {
          const urls = c.images.map((i) => i.url);
          return {
            name: c.name,
            hexCode: c.hexCode,
            imageUrl: getColorCoverUrl(urls),
          };
        })
      : undefined;

  return {
    images: cardImages,
    coverImageUrl,
    name: p.name,
    slug: p.slug,
    price:
      p.isSet && featuredPrice != null && !Number.isNaN(featuredPrice)
        ? featuredPrice
        : Number(p.basePrice),
    oldPrice,
    isSet: p.isSet || false,
    minPrice: undefined,
    badge: computeProductBadge({
      isProductNew: p.isProductNew,
      isProductNewAt: p.isProductNewAt,
      isOnSale: p.isOnSale,
      ...(totalStock !== undefined ? { stock: totalStock } : {}),
    }),
    colors: parentColors ?? featuredItemColors,
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
