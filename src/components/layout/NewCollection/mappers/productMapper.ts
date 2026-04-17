import { computeProductBadge } from "@/lib/productBadge";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";

type RawVariant = { stock: number };
type RawImage = { url: string };
type RawItemColor = { name: string; hexCode: string; images: RawImage[]; variants: RawVariant[] };
type RawColor = { name: string; hexCode: string; images: RawImage[]; variants: RawVariant[] };
type RawItem = {
  price: unknown;
  comparePrice: unknown;
  colors: RawItemColor[];
};

export type RawNewProduct = {
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
};

export function mapRawToCollectionProduct(p: RawNewProduct): CollectionProduct {
  const parentStock = p.colors.reduce(
    (acc, c) => acc + c.variants.reduce((s, v) => s + v.stock, 0),
    0
  );

  const totalStock =
    p.isSet && p.items?.length > 0
      ? p.items.reduce(
          (acc, item) =>
            acc + item.colors.reduce((s, c) => s + c.variants.reduce((vs, v) => vs + v.stock, 0), 0),
          0
        )
      : parentStock;

  const parentImages = p.images.map((i) => i.url);
  const cardImages: string[] =
    parentImages.length > 0
      ? parentImages
      : p.isSet && (p.items?.[0]?.colors?.[0]?.images?.length ?? 0) > 0
        ? p.items[0].colors[0].images.map((i) => i.url)
        : [];

  const itemPrices =
    p.isSet && p.items?.length > 0
      ? p.items
          .map((it) => (it.price ? Number(it.price) : null))
          .filter((v): v is number => v !== null)
      : [];
  const minPrice = itemPrices.length > 0 ? Math.min(...itemPrices) : undefined;

  // Para sets: oldPrice = comparePrice de la primera subcategoría (si existe)
  // Para productos normales: oldPrice = comparePrice del producto padre
  const oldPrice = p.isSet
    ? (p.items?.[0]?.comparePrice ? Number(p.items[0].comparePrice) : undefined)
    : (p.comparePrice ? Number(p.comparePrice) : undefined);

  // Para sets: si el padre no tiene colores, usar los colores de la primera subcategoría
  const parentColors =
    p.colors.length > 0
      ? p.colors.map((c) => ({ name: c.name, hexCode: c.hexCode, imageUrl: c.images[0]?.url ?? null }))
      : undefined;

  const firstItemColors =
    p.isSet && !parentColors && p.items?.[0]?.colors?.length > 0
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
      stock: totalStock,
    }),
    colors: parentColors ?? firstItemColors,
  };
}
