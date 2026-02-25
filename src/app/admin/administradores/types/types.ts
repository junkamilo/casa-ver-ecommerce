export interface Admin {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  image: string | null;
}

export interface LookupResult {
  exists: boolean;
  isAdmin?: boolean;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export type ToastState = { type: "success" | "error"; message: string } | null;
