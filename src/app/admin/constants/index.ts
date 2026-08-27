import { BadgePercent, BannerIcon, CategoryIcon, ColorIcon, ConfigIcon, DashboardIcon, InventoryIcon, MapIcon, OrdersIcon, PerfilIcon, ReportsIcon, ReviewsIcon, StackedShirtIcon, TruckIcon } from "@/components/icons";
import {
  Package,
  ClipboardList,
  BarChart3,
  Shield,
} from "lucide-react";
import type { NavItem, AdminNavItem } from "../types";

// --- Navegación del panel admin (sidebar + mobile) ---
export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard",  href: "/admin",                  icon: DashboardIcon },
  { label: "Inventario", href: "/admin/productos",         icon: InventoryIcon },
  { label: "Categorías",      href: "/admin/categorias",        icon: CategoryIcon },
  { label: "Tipos de Prenda", href: "/admin/tipos-de-prenda",  icon: StackedShirtIcon },
  { label: "Colores",         href: "/admin/colores",           icon: ColorIcon },
  { label: "Promociones",     href: "/admin/promociones",       icon: BadgePercent },
  { label: "Pedidos",    href: "/admin/pedidos",           icon: OrdersIcon },
  { label: "Reseñas",   href: "/admin/resenas",           icon: ReviewsIcon },
  { label: "Reportes",   href: "/admin/estadisticas",      icon: ReportsIcon },
  { label: "Banners",    href: "/admin/hero",               icon: BannerIcon },
  {
    label: "Configuraciones",
    icon: ConfigIcon,
    href: "/admin/configuraciones",
    children: [
      {
        label: "Precio envíos",
        href: "/admin/configuraciones/precio-envios",
        icon: TruckIcon,
      },
      {
        label: "Ciudades de envío",
        href: "/admin/configuraciones/ciudades-envios",
        icon: MapIcon,
      },
    ],
  },
  { label: "Admins",     href: "/admin/administradores",   icon: Shield },
  { label: "Mi Perfil",  href: "/admin/perfil",            icon: PerfilIcon },
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
