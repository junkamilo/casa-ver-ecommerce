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
  revenue: string;
  units: number;
  orders: number;
  avgTicket: string;
  topProduct: string;
  topProductUnits: number;
  activeProducts: number;
  trend: string;
}

export interface SizeSale {
  size: string;
  units: number;
  percentage: number;
  trend: string;
}

export interface ColorSale {
  colorName: string;
  units: number;
  percentage: number;
  trend: string;
}

export interface PaymentMethodSale {
  method: string;
  label: string;
  orders: number;
  revenue: string;
  percentage: number;
}

export interface GeographyItem {
  name: string;
  orders: number;
  revenue: string;
  percentage: number;
}

export interface GeographyData {
  departments: GeographyItem[];
  cities: GeographyItem[];
  totalOrders: number;
}

export interface RetentionData {
  returning: number;
  newBuyers: number;
  returningPercentage: number;
  totalBuyers: number;
}

export interface DiscountData {
  totalDiscount: string;
  discountedOrders: number;
  earlyBirdOrders: number;
  promotionOrders: number;
  couponsUsed: number;
  percentageOfRevenue: string;
}

export interface CancellationData {
  cancelled: number;
  total: number;
  rate: string;
  lostRevenue: string;
}

export interface ReviewsData {
  newReviews: number;
  avgRating: number;
  distribution: { stars: number; count: number }[];
}

export interface DeliveryTimeData {
  avgDays: number;
  minDays: number;
  maxDays: number;
  count: number;
}

export interface PeakHourData {
  hour: number;
  label: string;
  orders: number;
  percentage: number;
}

export interface FunnelItem {
  status: string;
  label: string;
  count: number;
  revenue: string;
  color: string;
  actionable: boolean;
  order: number;
}

export interface StockAlert {
  productName: string;
  colorName: string;
  size: string;
  sku: string;
  stock: number;
  minStock: number;
}
