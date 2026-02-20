import { LucideIcon } from "lucide-react";

export type ProfileSection = "perfil" | "pedidos";

export interface NavItem {
  id: ProfileSection;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface SidebarUser {
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}
