import { User, Package } from "lucide-react";
import { NavItem } from "./types";

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    id: "perfil",
    label: "Mi Perfil",
    description: "Información personal",
    icon: User,
  },
  {
    id: "pedidos",
    label: "Mis Pedidos",
    description: "Historial de compras",
    icon: Package,
  },
];
