import { computeProductBadge } from "@/lib/productBadge";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";

type RawVariant = { stock: number };
type RawImage = { url: string };
type RawColor = { name: string; hexCode: string; images: RawImage[]; variants: RawVariant[] };
type RawItem = { price: unknown; colors: { images: RawImage[]; variants: RawVariant[] }[] };

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
  const fallbackUrl =
    p.isSet && parentImages.length === 0
      ? (p.items?.[0]?.colors?.[0]?.images?.[0]?.url ?? null)
      : null;
  const cardImages = fallbackUrl ? [fallbackUrl] : parentImages;

  const itemPrices =
    p.isSet && p.items?.length > 0
      ? p.items
          .map((it) => (it.price ? Number(it.price) : null))
          .filter((v): v is number => v !== null)
      : [];
  const minPrice = itemPrices.length > 0 ? Math.min(...itemPrices) : undefined;

  return {
    images: cardImages,
    name: p.name,
    slug: p.slug,
    price: Number(p.basePrice),
    oldPrice: p.comparePrice ? Number(p.comparePrice) : undefined,
    isSet: p.isSet || false,
    minPrice,
    badge: computeProductBadge({
      isProductNew: p.isProductNew,
      isProductNewAt: p.isProductNewAt,
      isOnSale: p.isOnSale,
      stock: totalStock,
    }),
    colors:
      p.colors.length > 0
        ? p.colors.map((c) => ({
            name: c.name,
            hexCode: c.hexCode,
            imageUrl: c.images[0]?.url ?? null,
          }))
        : undefined,
  };
}
