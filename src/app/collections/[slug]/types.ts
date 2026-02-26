import type { StaticImageData } from "next/image";

export interface CollectionProduct {
  image: StaticImageData;
  name: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  slug: string;
  colorLabel?: string;
  colors?: string[];
}

export interface CategoryData {
  name: string;
  description?: string;
  bannerImage?: string;
}
