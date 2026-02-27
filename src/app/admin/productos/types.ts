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
  images: string[];
}

export interface SetItemForm {
  localId: string;
  name: string;
  price: string;
  videoUrl: string;
  stock: string;
  colors: SelectedColor[];
  sizes: string[];
}

export type ToastState = { type: "success" | "error"; message: string } | null;
