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

export interface SelectedColor {
  name: string;
  hexCode: string;
}

export type ToastState = { type: "success" | "error"; message: string } | null;
