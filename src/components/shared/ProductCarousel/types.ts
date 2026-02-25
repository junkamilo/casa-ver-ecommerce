import { StaticImageData } from "next/image";

export interface ProductItem {
  image: StaticImageData;
  name: string;
  price: string;
  oldPrice?: string;
  rating?: number;
  reviews?: string;
  colors?: string[];
  colorLabel?: string;
  badge?: string;
  slug: string;
}

export interface SectionConfig {
  eyebrow: string;
  titleStart: string;
  titleItalic: string;
  linkHref: string;
  linkText: string;
  bgColor: string;
  decorNumber: string;
  decorAlign: "left" | "right";
  badgeVariant?: "white" | "gold";
}
