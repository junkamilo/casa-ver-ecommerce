import { UIColor, UIProductItem, UIProduct } from "../types";
import { isVideoUrl } from "../utils";
import { computeProductBadge } from "@/lib/productBadge";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";
import {
  transformProduct,
  type CollectionRawProduct,
} from "@/app/collections/utils/fetchCollectionProducts";
import type { TestimonialItem } from "@/components/layout/Testimonials/types/types";

export function mapUIColor(color: any): UIColor {
  const allVariants = color.variants as any[];
  const activeVariants = allVariants.filter((v) => v.stock > 0);
  const totalStock = allVariants.reduce((s: number, v: any) => s + (v.stock as number), 0);
  return {
    id: color.id,
    name: color.name,
    hex: color.hexCode,
    images: (color.images as any[]).map((img) => img.url).filter((u: string) => !isVideoUrl(u)),
    availableSizes: activeVariants.map((v) => v.size as string),
    variants: activeVariants.map((v) => ({
      size: v.size as string,
      variantId: v.id as string,
      sku: v.sku as string,
    })),
    isOutOfStock: totalStock === 0,
  };
}

export function mapUIItems(items: any[]): UIProductItem[] {
  const sorted = [...(items ?? [])].sort((a, b) => {
    const ao = Number(a.order ?? 0);
    const bo = Number(b.order ?? 0);
    if (ao !== bo) return ao - bo;
    return String(a.id).localeCompare(String(b.id));
  });
  return sorted.map((item) => ({
    id: item.id,
    order: Number(item.order ?? 0),
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
  return products.map((p) => transformProduct(p as CollectionRawProduct));
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
