import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type {
  DashboardBacklogDTO,
  DashboardPaymentIncidentsDTO,
  DashboardRecentOrderDTO,
  DashboardSlaItemDTO,
} from "@/modules/adminCatalog/dashboard/contracts/dashboard.dto";
import type { DashboardStatItem } from "@/modules/adminCatalog/dashboard/presentation/types";

export type StatItem = DashboardStatItem;
export type RecentOrder = DashboardRecentOrderDTO;
export type DashboardSlaItem = DashboardSlaItemDTO;
export type DashboardBacklog = DashboardBacklogDTO;
export type DashboardPaymentIncidents = DashboardPaymentIncidentsDTO;

export interface NavItem {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  borderColor: string;
  hoverBorderColor: string;
  iconBg: string;
  iconColor: string;
  arrowColor: string;
  hoverTextColor: string;
}

export interface DashboardData {
  stats: StatItem[];
  recentOrders: RecentOrder[];
  slaQueue: DashboardSlaItem[];
  paymentIncidents: DashboardPaymentIncidents;
  backlog: DashboardBacklog;
  serverNow: string;
}

export interface OrderStatusInfo {
  label: string;
  styleClass: string;
}

export interface AdminNavItem {
  label: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
  /** Sub-ítems del módulo (ej. Configuraciones → Precio envíos) */
  children?: AdminNavItem[];
}
