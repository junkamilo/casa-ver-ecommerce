import {
  Package,
  ClipboardList,
  BarChart3,
  LayoutDashboard,
  Shield,
  UserCog,
  Tag,
} from "lucide-react";
import type { NavItem, OrderStatusInfo, AdminNavItem } from "./types";

// --- Navegación del panel admin (sidebar + mobile) ---
export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard",  href: "/admin",                  icon: LayoutDashboard },
  { label: "Inventario", href: "/admin/productos",         icon: Package },
  { label: "Categorías", href: "/admin/categorias",        icon: Tag },
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

// --- Formatea moneda COP ---
export const formatCOP = (amount: number | bigint | string): string => {
  const num = Number(amount);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// --- Mapea OrderStatus a etiquetas y estilos UI ---
export const mapOrderStatus = (status: string): OrderStatusInfo => {
  const statusMap: Record<string, OrderStatusInfo> = {
    PAID:       { label: "Pagado",     styleClass: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    PENDING:    { label: "Pendiente",  styleClass: "bg-amber-50 text-amber-700 border-amber-200" },
    PROCESSING: { label: "Procesando", styleClass: "bg-blue-50 text-blue-700 border-blue-200" },
    SHIPPED:    { label: "Enviado",    styleClass: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    DELIVERED:  { label: "Entregado",  styleClass: "bg-green-50 text-green-700 border-green-200" },
    CANCELLED:  { label: "Cancelado",  styleClass: "bg-red-50 text-red-700 border-red-200" },
    FAILED:     { label: "Fallido",    styleClass: "bg-red-50 text-red-700 border-red-200" },
  };
  return statusMap[status] ?? { label: status, styleClass: "bg-gray-100 text-gray-800" };
};

// --- Calcula tiempo relativo legible ---
export const timeAgo = (date: Date): string => {
  const secondsAgo = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secondsAgo < 60) return "Hace unos segundos";
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `Hace ${minutesAgo} min`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `Hace ${hoursAgo} hora${hoursAgo > 1 ? "s" : ""}`;
  const daysAgo = Math.floor(hoursAgo / 24);
  return `Hace ${daysAgo} día${daysAgo > 1 ? "s" : ""}`;
};
