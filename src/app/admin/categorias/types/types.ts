export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

export type ToastState = { type: "success" | "error"; message: string } | null;
