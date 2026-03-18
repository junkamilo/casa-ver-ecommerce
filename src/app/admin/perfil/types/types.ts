export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
}

export type ToastState = { type: "success" | "error"; message: string } | null;
