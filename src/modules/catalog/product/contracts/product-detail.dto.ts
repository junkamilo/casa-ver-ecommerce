import type { CollectionProduct } from "@/components/shared/ProductCollection/types";
import type { TestimonialItem } from "@/components/layout/Testimonials/types/types";

// ── DTOs UI del PDP ──────────────────────────────────────────────────────────
//
// Estos tipos describen la "vista de producto" que consumen los componentes
// cliente del PDP (`ProductClient`, `ProductGallery`, `ColorSelector`, etc.).
// Difieren del DTO `CollectionProduct` (card del catálogo) porque el PDP
// necesita datos detallados: variants por talla, items para sets, reviews,
// stock por color, etc.

export interface ExistingReview {
  rating: number;
  comment: string | null;
}

export interface UIColorVariant {
  size: string;
  variantId: string;
  sku: string;
}

export interface UIColor {
  id: string;
  name: string;
  hex: string;
  images: string[];
  availableSizes: string[];
  variants: UIColorVariant[];
  isOutOfStock: boolean;
}

export interface UIProductItem {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  comparePrice: number | null;
  videoUrl: string | null;
  coverImageUrl: string | null;
  colors: UIColor[];
  stock: number;
}

export interface UIProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  comparePrice: number | null;
  videoUrl: string | null;
  coverImageUrl: string | null;
  generalImages: string[];
  colors: UIColor[];
  rating: number;
  numReviews: number;
  stock: number;
  isSet: boolean;
  items: UIProductItem[];
  badge?: string;
}

export interface BuyerInfo {
  name: string;
  avatar: string | null;
}

export interface ProductSocialProof {
  totalBuyers: number;
  recentBuyers: BuyerInfo[];
}

export interface ProductClientProps {
  product: UIProduct;
  recommended: CollectionProduct[];
  existingReview: ExistingReview | null;
  isAuthenticated: boolean;
  reviews: TestimonialItem[];
  socialProof: ProductSocialProof;
  initialItemId?: string | null;
}

// ── Resultado completo del use case `getProductDetail` ────────────────────────

export interface ProductDetailResultDTO {
  product: UIProduct;
  recommended: CollectionProduct[];
  existingReview: ExistingReview | null;
  reviews: TestimonialItem[];
  socialProof: ProductSocialProof;
  initialItemId: string | null;
}

// ── Resultado del use case SEO ───────────────────────────────────────────────

export interface ProductSeoDTO {
  name: string;
  description: string;
  metaTitle: string | null;
  metaDescription: string | null;
  firstImageUrl: string | null;
}

// ── Resultado de Server Actions de reviews ───────────────────────────────────

export interface ReviewActionResult {
  success: boolean;
  error?: string;
}
