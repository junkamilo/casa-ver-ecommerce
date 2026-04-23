import { computeProductBadge } from "@/lib/productBadge";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";
import {
  transformProduct,
  type CollectionRawProduct,
} from "@/app/collections/utils/fetchCollectionProducts";

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

  const base = transformProduct(p as unknown as CollectionRawProduct);
  return {
    ...base,
    badge: computeProductBadge({
      isProductNew: p.isProductNew,
      isProductNewAt: p.isProductNewAt,
      isOnSale: p.isOnSale,
      stock: totalStock,
    }),
  };
}
