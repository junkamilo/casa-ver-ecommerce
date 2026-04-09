import { LucideIcon } from "lucide-react";
import { ProfileSection } from "../sidebar/types";

// ── Entidad ──────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
}

// ── Toast ────────────────────────────────────────────────────────────────────

export interface ToastState {
  type: "success" | "error";
  message: string;
}

// ── Hook useProfile ───────────────────────────────────────────────────────────

export interface UseProfileResult {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  loading: boolean;
  fetchError: string | null;
  toast: ToastState | null;
  showToast: (type: "success" | "error", message: string) => void;
  dismissToast: () => void;
  isSidebarOpen: boolean;
  openSidebar: () => void;
  toggleSidebar: () => void;
}

// ── Navegación del perfil ─────────────────────────────────────────────────────

export interface PerfilNavItem {
  id: ProfileSection;
  label: string;
  description: string;
  icon: LucideIcon;
}
