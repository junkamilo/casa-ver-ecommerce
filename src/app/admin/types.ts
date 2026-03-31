import type { LucideIcon } from "lucide-react";

export interface StatItem {
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

export interface RecentOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: Date;
  paymentMethod: string | null;
  user: { name: string | null } | null;
}

export interface DashboardData {
  stats: StatItem[];
  recentOrders: RecentOrder[];
}

export interface OrderStatusInfo {
  label: string;
  styleClass: string;
}

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}
