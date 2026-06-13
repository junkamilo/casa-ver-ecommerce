import { computeProductBadge } from "@/lib/productBadge";
import type { TestimonialItem } from "@/components/layout/Testimonials/types/types";
import {
  type UIColor,
  type UIProductItem,
  type UIProduct,
  type ProductSocialProof,
} from "../contracts/product-detail.dto";
import { isVideoUrl } from "./video-url.entity";

// ── Sort de tallas ───────────────────────────────────────────────────────────

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const SIZE_ORDER_INDEX = new Map<string, number>(
  SIZE_ORDER.map((size, index) => [size, index]),
);

function normalizeSize(size: unknown): string {
  return String(size ?? "")
    .trim()
    .toUpperCase();
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

// ── Slug helpers (para resolver `?tipo=` en sets) ────────────────────────────

export function normalizeToSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeTipoCandidates(tipo: string): string[] {
  const normalized = normalizeToSlug(tipo);
  const singular = normalized.endsWith("s")
    ? normalized.slice(0, -1)
    : normalized;
  return Array.from(new Set([normalized, singular])).filter(Boolean);
}

// ── Tipos crudos esperados desde el repositorio ──────────────────────────────

type RawVariant = { id: string; sku: string; size: string; stock: number };

interface RawColor {
  id: string;
  name: string;
  hexCode: string;
  images: { url: string; colorId?: string | null }[];
  variants: RawVariant[];
}

interface RawItem {
  id: string;
  name: string;
  description?: string | null;
  price: unknown;
  comparePrice: unknown;
  videoUrl?: string | null;
  colors: RawColor[];
}

interface RawReview {
  rating: number;
  comment: string | null;
  createdAt: Date | string;
  user: { name: string | null } | null;
}

interface RawProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: unknown;
  comparePrice: unknown;
  videoUrl: string | null;
  isSet: boolean;
  isProductNew: boolean;
  isProductNewAt: Date | null;
  isOnSale: boolean;
  images: { url: string; colorId?: string | null }[];
  colors: RawColor[];
  items: RawItem[];
  reviews: RawReview[];
}

// ── Mappers de UI ─────────────────────────────────────────────────────────────

export function mapUIColor(color: RawColor): UIColor {
  const allVariants = color.variants;
  const activeVariants = allVariants
    .filter((v) => v.stock > 0)
    .sort((a, b) => compareSizes(a.size, b.size));
  const totalStock = allVariants.reduce((s, v) => s + v.stock, 0);
  return {
    id: color.id,
    name: color.name,
    hex: color.hexCode,
    images: color.images.map((img) => img.url),
    availableSizes: activeVariants.map((v) => normalizeSize(v.size)),
    variants: activeVariants.map((v) => ({
      size: normalizeSize(v.size),
      variantId: v.id,
      sku: v.sku,
    })),
    isOutOfStock: totalStock === 0,
  };
}

export function mapUIItems(items: RawItem[]): UIProductItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? null,
    price: item.price ? Number(item.price) : null,
    comparePrice: item.comparePrice ? Number(item.comparePrice) : null,
    videoUrl: item.videoUrl ?? null,
    stock: item.colors.reduce(
      (acc, c) => acc + c.variants.reduce((s, v) => s + v.stock, 0),
      0,
    ),
    colors: item.colors.map(mapUIColor),
  }));
}

export function computeTotalStock(
  product: Pick<RawProductDetail, "isSet" | "colors">,
  uiItems: UIProductItem[],
): number {
  const parentStock = product.colors.reduce(
    (acc, color) => acc + color.variants.reduce((s, v) => s + v.stock, 0),
    0,
  );
  return product.isSet && uiItems.length > 0
    ? uiItems.reduce((acc, item) => acc + item.stock, 0)
    : parentStock;
}

export function mapUIProduct(
  product: RawProductDetail,
  uiItems: UIProductItem[],
  totalStock: number,
  liveRating: number,
  liveNumReviews: number,
  resolvedVideoUrl: string | null,
  allGeneralImages: string[],
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
    colors: product.colors.map(mapUIColor),
    rating: liveRating,
    numReviews: liveNumReviews,
    stock: totalStock,
    isSet: product.isSet ?? false,
    items: uiItems,
    badge: computeProductBadge({
      isProductNew: product.isProductNew,
      isProductNewAt: product.isProductNewAt,
      isOnSale: product.isOnSale,
      stock: totalStock,
    }),
  };
}

// ── Reviews y social proof ───────────────────────────────────────────────────

export function mapProductReviews(reviews: RawReview[]): TestimonialItem[] {
  return reviews.map((r) => ({
    rating: r.rating,
    comment: r.comment ?? "",
    name: r.user?.name ?? "Clienta",
    date: new Date(r.createdAt).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
    }),
  }));
}

interface RawBuyerOrder {
  shippingName: string | null;
  user: { image: string | null } | null;
}

export function mapSocialProof(buyerOrders: RawBuyerOrder[]): ProductSocialProof {
  return {
    totalBuyers: buyerOrders.length,
    recentBuyers: buyerOrders.slice(0, 3).map((o) => ({
      name: (o.shippingName ?? "").trim().split(" ")[0] ?? "Clienta",
      avatar: o.user?.image ?? null,
    })),
  };
}

// ── Métricas agregadas de reviews ────────────────────────────────────────────

export function computeReviewMetrics(reviews: RawReview[]): {
  liveRating: number;
  liveNumReviews: number;
} {
  const liveNumReviews = reviews.length;
  const liveRating =
    liveNumReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / liveNumReviews
      : 0;
  return { liveRating, liveNumReviews };
}

// ── Resolver `initialItemId` desde el query param `tipo` ─────────────────────

export function resolveInitialItemId(
  isSet: boolean,
  uiItems: UIProductItem[],
  tipo: string | undefined,
): string | null {
  if (!isSet || !tipo) return null;
  const candidates = normalizeTipoCandidates(tipo);
  if (candidates.length === 0) return null;
  const match = uiItems.find((item) => {
    const normalized = normalizeToSlug(item.name);
    return candidates.some(
      (candidate) =>
        normalized === candidate ||
        normalized.includes(candidate) ||
        candidate.includes(normalized),
    );
  });
  return match?.id ?? null;
}

// ── Resolver galería e información de video ─────────────────────────────────

export function resolveGalleryAndVideo(
  product: Pick<RawProductDetail, "images" | "videoUrl">,
): { allGeneralImages: string[]; resolvedVideoUrl: string | null } {
  const allGeneralImages: string[] = product.images
    .filter((img) => !img.colorId)
    .map((img) => img.url);
  const dbVideoUrl = product.videoUrl;
  const resolvedVideoUrl =
    dbVideoUrl ?? allGeneralImages.find(isVideoUrl) ?? null;
  return { allGeneralImages, resolvedVideoUrl };
}

// ── User review extraída del array de reviews ya cargado ─────────────────────

export function extractUserReview(
  reviews: (RawReview & { userId?: string })[],
  userId: string | null,
): { rating: number; comment: string | null } | null {
  if (!userId) return null;
  const found = reviews.find((r) => r.userId === userId);
  if (!found) return null;
  return {
    rating: found.rating,
    comment: found.comment ?? null,
  };
}
