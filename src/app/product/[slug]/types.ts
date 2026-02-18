import { StaticImageData } from "next/image";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  name: string;
  type: string;
  price: number;
  description: string;
  rating: number;
  reviews: number;
  colors: ProductColor[];
  sizes: string[];
  gallery: StaticImageData[];
}
