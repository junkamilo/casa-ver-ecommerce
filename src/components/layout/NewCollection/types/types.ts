import { StaticImageData } from "next/image";

export interface CollectionItem {
  image: StaticImageData;
  name: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  colors?: string[];
  colorLabel?: string;
  slug: string;
}
