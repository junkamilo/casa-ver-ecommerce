import type { CollectionProduct } from "@/components/shared/ProductCollection/types";
import type { TestimonialItem } from "@/components/layout/Testimonials/types/types";

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

export interface ProductClientProps {
  product: UIProduct;
  recommended: CollectionProduct[];
  existingReview: ExistingReview | null;
  isAuthenticated: boolean;
  reviews: TestimonialItem[];
  socialProof: { totalBuyers: number; recentBuyers: BuyerInfo[] };
  initialItemId?: string | null;
}
