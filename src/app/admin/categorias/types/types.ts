export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    products: number;
  };
}

export type ToastState = { type: "success" | "error"; message: string } | null;
