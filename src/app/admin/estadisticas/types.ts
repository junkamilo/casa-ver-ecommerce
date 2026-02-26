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
