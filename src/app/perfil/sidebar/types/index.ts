import { LucideIcon } from "lucide-react";

// ── Dominio ───────────────────────────────────────────────────────────────────

export type ProfileSection = "perfil" | "pedidos" | "direcciones";

export interface SidebarUser {
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

export interface NavItem {
  id: ProfileSection;
  label: string;
  description: string;
  icon: LucideIcon;
}

// ── Hook useProfileNav ────────────────────────────────────────────────────────

export interface UseProfileNavResult {
  activeSection: ProfileSection;
  setActiveSection: (section: ProfileSection) => void;
  isActive: (section: ProfileSection) => boolean;
}

// ── Props de componentes ──────────────────────────────────────────────────────

export interface ProfileSidebarProps {
  user: SidebarUser;
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
  isAdmin?: boolean;
}

export interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  mobile?: boolean;
}

export interface SidebarUserCardProps {
  user: SidebarUser;
}
