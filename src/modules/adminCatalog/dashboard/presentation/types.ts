import type { LucideIcon } from "lucide-react";

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
}
