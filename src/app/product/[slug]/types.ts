import type { StaticImageData } from "next/image";

export interface ProductVariant {
  name: string;
  type: string;
  price: number;
  description: string;
  rating: number;
  reviews: number;
  colors: { name: string; hex: string }[];
  sizes: string[];
  gallery: (StaticImageData | string)[];
}

export interface UIColor {
  id: string;
  name: string;
  hex: string;
  images: string[];
  availableSizes: string[];
}

export interface UIProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  comparePrice: number | null;
  material: string | null;
  careInfo: string | null;
  videoUrl: string | null;
  generalImages: string[];
  colors: UIColor[];
}

export interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
}
