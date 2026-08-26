import { ComponentType } from "react";

export interface AppSidebarNavItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  isActive: boolean;
  /** Usa Link si se provee href, botón si se provee onClick */
  href?: string;
  onClick?: () => void;
  description?: string;
  /** Sub-ítems anidados (ej. Configuraciones) */
  children?: AppSidebarNavItem[];
}

export interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  navItems: AppSidebarNavItem[];
  /** Subtítulo bajo "Casa Verde" en el logo — ej. "Admin Panel" | "Mi Cuenta" */
  brandSubtitle: string;
  userName: string | null | undefined;
  userInitial: string;
  userRole: string;
  backLink: { href: string; label: string };
  /** Enlace extra en el footer (ej. "Panel Admin" para clientes con rol ADMIN) */
  extraLink?: { href: string; label: string };
}

export interface NavItemContentProps {
  item: AppSidebarNavItem;
  collapsed: boolean;
}

export interface NavItemProps {
  item: AppSidebarNavItem;
  collapsed: boolean;
}

export interface MobileDrawerProps {
  onToggle: () => void;
  navItems: AppSidebarNavItem[];
  brandSubtitle: string;
  userName: string | null | undefined;
  userInitial: string;
  userRole: string;
  backLink: { href: string; label: string };
  extraLink?: { href: string; label: string };
}

export interface DesktopSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  navItems: AppSidebarNavItem[];
  brandSubtitle: string;
  userName: string | null | undefined;
  userInitial: string;
  userRole: string;
  backLink: { href: string; label: string };
  extraLink?: { href: string; label: string };
}
