import type {
  CancellationData,
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
} from "../contracts/stats.dto";

export const mapStatsToUi = (data: SalesPeriodData): SalesPeriodData => data;
export const mapTopProductsToUi = (data: TopProduct[]): TopProduct[] => data;
export const mapDailySalesToUi = (data: DailySale[]): DailySale[] => data;
export const mapCategorySalesToUi = (data: CategorySale[]): CategorySale[] => data;
export const mapSizeSalesToUi = (data: SizeSale[]): SizeSale[] => data;
export const mapColorSalesToUi = (data: ColorSale[]): ColorSale[] => data;
export const mapPaymentMethodsToUi = (data: PaymentMethodSale[]): PaymentMethodSale[] => data;
export const mapGeographyToUi = (data: GeographyData): GeographyData => data;
export const mapRetentionToUi = (data: RetentionData): RetentionData => data;
export const mapDiscountToUi = (data: DiscountData): DiscountData => data;
export const mapCancellationToUi = (data: CancellationData): CancellationData => data;
export const mapReviewsToUi = (data: ReviewsData): ReviewsData => data;
export const mapDeliveryTimeToUi = (data: DeliveryTimeData): DeliveryTimeData => data;
export const mapPeakHoursToUi = (data: PeakHourData[]): PeakHourData[] => data;
export const mapFunnelToUi = (data: FunnelItem[]): FunnelItem[] => data;
export const mapStockAlertsToUi = (data: StockAlert[]): StockAlert[] => data;
