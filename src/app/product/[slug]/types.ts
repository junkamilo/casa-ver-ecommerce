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
}

export interface UIProductItem {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
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
  material: string | null;
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

