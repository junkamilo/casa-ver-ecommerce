import { StaticImageData } from "next/image";

export interface ProductCard {
  image: StaticImageData;
  name: string;
  price: string;
  rating?: number;
  reviews?: string;
  colors?: string[];
  colorLabel?: string;
  badge?: string;
  slug: string;
}
