import type { ColorInput, SetItemInput } from "../infrastructure/product-relations.helpers";

export type ProductCreateInputDTO = {
  name: string;
  description?: string;
  basePrice: number;
  comparePrice?: number | null;
  stock?: number;
  categoryId: string;
  status?: "ACTIVE" | "INACTIVE";
  isFeatured?: boolean;
  isNew?: boolean;
  isProductNew?: boolean;
  isProductNewAt?: string | null;
  isOnSale?: boolean;
  isOnSaleAt?: string | null;
  videoUrl?: string | null;
  isSet?: boolean;
  colors: ColorInput[];
  sizes: string[];
  items?: SetItemInput[];
  garmentTypes?: string[] | string;
  garmentType?: string;
};
