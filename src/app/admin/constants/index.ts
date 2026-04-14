import {
  Package,
  ClipboardList,
  BarChart3,
  LayoutDashboard,
  Shield,
  UserCog,
  Tag,
  Layers,
} from "lucide-react";
import type { NavItem, AdminNavItem } from "../types";

// --- Navegación del panel admin (sidebar + mobile) ---
export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard",  href: "/admin",                  icon: LayoutDashboard },
  { label: "Inventario", href: "/admin/productos",         icon: Package },
  { label: "Categorías",      href: "/admin/categorias",        icon: Tag },
  { label: "Tipos de Prenda", href: "/admin/tipos-de-prenda",  icon: Layers },
  { label: "Pedidos",    href: "/admin/pedidos",           icon: ClipboardList },
  { label: "Reportes",   href: "/admin/estadisticas",      icon: BarChart3 },
  { label: "Admins",     href: "/admin/administradores",   icon: Shield },
  { label: "Mi Perfil",  href: "/admin/perfil",            icon: UserCog },
];

// --- Menú de navegación horizontal ---
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Inventario",
    href: "/admin/productos",
    description: "Administra tu catálogo, actualiza precios y controla el stock.",
    icon: Package,
    borderColor: "border-[#154734]/20",
    hoverBorderColor: "sm:hover:border-[#C19A6B]",
    iconBg: "bg-[#154734]/10",
    iconColor: "text-[#154734]",
    arrowColor: "text-[#C19A6B]",
    hoverTextColor: "sm:group-hover:text-[#154734]",
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
    description: "Revisa órdenes entrantes, estados de envío y detalles de clientes.",
    icon: ClipboardList,
    borderColor: "border-blue-200",
    hoverBorderColor: "sm:hover:border-blue-300",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    arrowColor: "text-blue-500",
    hoverTextColor: "sm:group-hover:text-blue-700",
  },
  {
    label: "Reportes",
    href: "/admin/estadisticas",
    description: "Analiza el rendimiento de ventas y métricas clave de tu negocio.",
    icon: BarChart3,
    borderColor: "border-purple-200",
    hoverBorderColor: "sm:hover:border-purple-300",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    arrowColor: "text-purple-500",
    hoverTextColor: "sm:group-hover:text-purple-700",
  },
];
