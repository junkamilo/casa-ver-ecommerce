export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: { name: string };
  active: boolean;
  images: { url: string }[];
  description?: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface VariantForm {
  stock: string;
  priceOverride: string;
}

export interface ColorForm {
  tempId: string;
  name: string;
  hexCode: string;
  images: string[];
  variants: Record<string, VariantForm>;
}

export type ToastState = { type: "success" | "error"; message: string } | null;
