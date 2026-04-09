// ── Dominio ───────────────────────────────────────────────────────────────────

export type Period = "day" | "week" | "month";

export interface SalesPeriodData {
  total: string;
  orders: number;
  avgTicket: string;
  newCustomers: number;
  change: string;
}

export interface TopProduct {
  name: string;
  sold: number;
  revenue: string;
  trend: string;
}

export interface DailySale {
  day: string;
  amount: number;
}

export interface CategorySale {
  name: string;
  percentage: number;
  color: string;
}

// ── Props de componentes ──────────────────────────────────────────────────────

export interface KpiCardsProps {
  data: SalesPeriodData;
}

export interface SalesChartProps {
  salesData: DailySale[];
}

export interface CategoryChartProps {
  categorySales: CategorySale[];
}

export interface TopProductsTableProps {
  products: TopProduct[];
}

export interface RankBadgeProps {
  rank: number;
}

export interface TrendBadgeProps {
  trend: string;
  variant?: "desktop" | "mobile";
}
