export interface DashboardStatDTO {
  label: string;
  value: string;
  change: string;
  icon: "dollar" | "cart" | "package" | "users" | "star";
  color: string;
  bg: string;
  border: string;
  changeBg?: string;
  changeColor?: string;
}

export interface DashboardRecentOrderDTO {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: Date;
  paymentMethod: string | null;
  user: { name: string | null } | null;
}

export interface DashboardDataDTO {
  stats: DashboardStatDTO[];
  recentOrders: DashboardRecentOrderDTO[];
}
