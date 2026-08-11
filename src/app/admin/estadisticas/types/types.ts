import type {
  CancellationData,
  CategorySale,
  DailySale,
  Period,
  RetentionData,
  SalesPeriodData,
  TopProduct,
} from "@/modules/adminCatalog/stats/contracts/stats.dto";

export type { Period };

export type {
  CategorySale,
  ColorSale,
  DailySale,
  DeliveryTimeData,
  DiscountData,
  FunnelItem,
  GeographyData,
  PeakHourData,
  PaymentMethodSale,
  RetentionData,
  ReviewsData,
  SalesPeriodData,
  SizeSale,
  StockAlert,
  TopProduct,
} from "@/modules/adminCatalog/stats/contracts/stats.dto";

// ── Props de componentes ──────────────────────────────────────────────────────

export interface KpiCardsProps {
  data: SalesPeriodData;
  retention: RetentionData;
  cancellation: CancellationData;
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
