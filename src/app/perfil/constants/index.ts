import { User, Package, MapPin } from "lucide-react";
import { PerfilNavItem } from "../types";
import { ProfileSection } from "../sidebar/types";

export const PERFIL_NAV: PerfilNavItem[] = [
  { id: "perfil",      label: "Mi Perfil",       description: "Información personal",  icon: User    },
  { id: "pedidos",     label: "Mis Pedidos",      description: "Historial de compras",  icon: Package },
  { id: "direcciones", label: "Mis Direcciones",  description: "Direcciones de envío",  icon: MapPin  },
];

export const BREADCRUMB_LABELS: Record<ProfileSection, string> = {
  perfil:      "Mi Perfil",
  pedidos:     "Mis Pedidos",
  direcciones: "Mis Direcciones",
};
