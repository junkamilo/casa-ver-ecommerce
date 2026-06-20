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

export type DashboardSlaSeverity = "warning" | "critical";

export interface DashboardSlaItemDTO {
  orderId: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  waitingMinutes: number;
  waitingLabel: string;
  severity: DashboardSlaSeverity;
  suggestedAction: string;
  customerName: string | null;
  total: number;
}

export interface DashboardIncidentItemDTO {
  id: string;
  provider: string;
  eventType: string | null;
  status: number;
  errorMessage: string | null;
  createdAt: Date;
  orderId: string | null;
}

export interface DashboardPaymentIncidentsDTO {
  windowMinutes: number;
  totalEvents: number;
  errorCount: number;
  byProvider: { provider: string; total: number; errors: number }[];
  recent: DashboardIncidentItemDTO[];
}

export interface DashboardBacklogDTO {
  pendingReviews: number;
  unreadNotifications: number;
  ordersNeedingAttention: number;
  pendingOrders: number;
  paidAwaitingFulfillment: number;
  processingOrders: number;
}

export interface DashboardDataDTO {
  stats: DashboardStatDTO[];
  recentOrders: DashboardRecentOrderDTO[];
  slaQueue: DashboardSlaItemDTO[];
  paymentIncidents: DashboardPaymentIncidentsDTO;
  backlog: DashboardBacklogDTO;
  serverNow: string;
}
