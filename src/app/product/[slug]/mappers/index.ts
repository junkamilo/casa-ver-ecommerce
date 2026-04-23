import { UIColor, UIProductItem, UIProduct } from "../types";
import { isVideoUrl } from "../utils";
import { computeProductBadge } from "@/lib/productBadge";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";
import type { TestimonialItem } from "@/components/layout/Testimonials/types/types";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const SIZE_ORDER_INDEX = new Map<string, number>(SIZE_ORDER.map((size, index) => [size, index]));

function normalizeSize(size: unknown): string {
  return String(size ?? "").trim().toUpperCase();
}

function compareSizes(a: unknown, b: unknown): number {
  const sizeA = normalizeSize(a);
  const sizeB = normalizeSize(b);
  const orderA = SIZE_ORDER_INDEX.get(sizeA);
  const orderB = SIZE_ORDER_INDEX.get(sizeB);

  if (orderA !== undefined && orderB !== undefined) return orderA - orderB;
  if (orderA !== undefined) return -1;
  if (orderB !== undefined) return 1;
  return sizeA.localeCompare(sizeB, "es");
}

export function mapUIColor(color: any): UIColor {
  const allVariants = color.variants as any[];
  const activeVariants = allVariants
    .filter((v) => v.stock > 0)
    .sort((a, b) => compareSizes(a.size, b.size));
  const totalStock = allVariants.reduce((s: number, v: any) => s + (v.stock as number), 0);
  return {
    id: color.id,
    name: color.name,
    hex: color.hexCode,
    images: (color.images as any[]).map((img) => img.url).filter((u: string) => !isVideoUrl(u)),
    availableSizes: activeVariants.map((v) => normalizeSize(v.size)),
    variants: activeVariants.map((v) => ({
      size: normalizeSize(v.size),
      variantId: v.id as string,
      sku: v.sku as string,
    })),
    isOutOfStock: totalStock === 0,
  };
}

export function mapUIItems(items: any[]): UIProductItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? null,
    price: item.price ? Number(item.price) : null,
    comparePrice: item.comparePrice ? Number(item.comparePrice) : null,
    videoUrl: item.videoUrl ?? null,
    stock: (item.colors as any[]).reduce(
      (acc: number, c: any) =>
        acc + (c.variants as any[]).reduce((s: number, v: any) => s + v.stock, 0),
      0
    ),
    colors: (item.colors as any[]).map(mapUIColor),
  }));
}

export function computeTotalStock(product: any, uiItems: UIProductItem[]): number {
  const parentStock = (product.colors as any[]).reduce(
    (acc: number, color: any) =>
      acc + (color.variants as any[]).reduce((s: number, v: any) => s + v.stock, 0),
    0
  );
  return product.isSet && uiItems.length > 0
    ? uiItems.reduce((acc, item) => acc + item.stock, 0)
    : parentStock;
}

export function mapUIProduct(
  product: any,
  uiItems: UIProductItem[],
  totalStock: number,
  liveRating: number,
  liveNumReviews: number,
  resolvedVideoUrl: string | null,
  allGeneralImages: string[]
): UIProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: Number(product.basePrice),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    videoUrl: resolvedVideoUrl,
    generalImages: allGeneralImages.filter((url) => !isVideoUrl(url)),
    colors: (product.colors as any[]).map(mapUIColor),
    rating: liveRating,
    numReviews: liveNumReviews,
    stock: totalStock,
    isSet: product.isSet ?? false,
    items: uiItems,
    badge: computeProductBadge({
      isProductNew: product.isProductNew as boolean | undefined,
      isProductNewAt: product.isProductNewAt as Date | null | undefined,
      isOnSale: product.isOnSale as boolean | undefined,
      stock: totalStock,
    }),
  };
}

export function mapRecommended(products: any[]): CollectionProduct[] {
  return products.map((p) => {
    const parentImages: string[] = (p.images as { url: string }[]).map((i) => i.url);
    const cardImages: string[] =
      parentImages.length > 0
        ? parentImages
        : p.isSet && (p.items?.[0]?.colors?.[0]?.images?.length ?? 0) > 0
          ? (p.items[0].colors[0].images as { url: string }[]).map((i) => i.url)
          : [];

    const itemPrices: number[] =
      p.isSet && (p.items as any[])?.length > 0
        ? (p.items as any[])
            .map((it: any) => (it.price ? Number(it.price) : null))
            .filter((v: number | null): v is number => v !== null)
        : [];
    const minPrice = itemPrices.length > 0 ? Math.min(...itemPrices) : undefined;

    // Para sets: oldPrice = comparePrice de la primera subcategoría (si existe)
    const oldPrice = p.isSet
      ? (p.items?.[0]?.comparePrice ? Number(p.items[0].comparePrice) : undefined)
      : (p.comparePrice ? Number(p.comparePrice) : undefined);

    // Para sets: si el padre no tiene colores, usar los de la primera subcategoría
    type ItemColor = { name: string; hexCode: string; images: { url: string }[] };
    const parentColors =
      (p.colors as any[]).length > 0
        ? (p.colors as any[]).map((c: ItemColor) => ({
            name: c.name,
            hexCode: c.hexCode,
            imageUrl: c.images[0]?.url ?? null,
          }))
        : undefined;
    const firstItemColors =
      p.isSet && !parentColors && p.items?.[0]?.colors?.length > 0
        ? (p.items[0].colors as ItemColor[]).map((c) => ({
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
      }),
      colors: parentColors ?? firstItemColors,
    };
  });
}

export function mapProductReviews(reviews: any[]): TestimonialItem[] {
  return reviews.map((r) => ({
    rating: r.rating as number,
    comment: (r.comment as string | null) ?? "",
    name: (r.user?.name as string | null) ?? "Clienta",
    date: new Date(r.createdAt as string).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
    }),
  }));
}

export function mapSocialProof(buyerOrders: any[]): {
  totalBuyers: number;
  recentBuyers: { name: string; avatar: string | null }[];
} {
  return {
    totalBuyers: buyerOrders.length,
    recentBuyers: buyerOrders.slice(0, 3).map((o) => ({
      name: (o.shippingName ?? "").trim().split(" ")[0] ?? "Clienta",
      avatar: o.user.image ?? null,
    })),
  };
}
