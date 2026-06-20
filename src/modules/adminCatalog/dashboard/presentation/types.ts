import type { LucideIcon } from "lucide-react";
import type {
  DashboardBacklogDTO,
  DashboardPaymentIncidentsDTO,
  DashboardSlaItemDTO,
} from "../contracts/dashboard.dto";

export interface DashboardStatItem {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  changeBg?: string;
  changeColor?: string;
}

export interface DashboardRecentOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: Date;
  paymentMethod: string | null;
  user: { name: string | null } | null;
}

export interface DashboardDataViewModel {
  stats: DashboardStatItem[];
  recentOrders: DashboardRecentOrder[];
  slaQueue: DashboardSlaItemDTO[];
  paymentIncidents: DashboardPaymentIncidentsDTO;
  backlog: DashboardBacklogDTO;
  serverNow: string;
}
