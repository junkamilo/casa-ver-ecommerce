import {
  getAvgDeliveryTime,
  getCancellationRateByPeriod,
  getCategorySalesByPeriod,
  getColorsSalesByPeriod,
  getDailySalesByPeriod,
  getDiscountImpactByPeriod,
  getGeographyByPeriod,
  getLowStockAlerts,
  getOrdersFunnel,
  getPaymentMethodsByPeriod,
  getPeakHoursByPeriod,
  getRetentionByPeriod,
  getReviewsByPeriod,
  getSizesSalesByPeriod,
  getStatsByPeriod,
  getTopProductsByPeriod,
} from "../application/stats.use-case";
import type { Period } from "../contracts/stats.dto";

export async function fetchStatsByPeriod(period: Period) {
  return getStatsByPeriod(period);
}

export async function fetchTopProductsByPeriod(period: Period, limit = 8) {
  return getTopProductsByPeriod(period, limit);
}

export async function fetchDailySalesByPeriod(period: Period) {
  return getDailySalesByPeriod(period);
}

export async function fetchCategorySalesByPeriod(period: Period) {
  return getCategorySalesByPeriod(period);
}

export async function fetchSizesSalesByPeriod(period: Period) {
  return getSizesSalesByPeriod(period);
}

export async function fetchColorsSalesByPeriod(period: Period) {
  return getColorsSalesByPeriod(period);
}

export async function fetchPaymentMethodsByPeriod(period: Period) {
  return getPaymentMethodsByPeriod(period);
}

export async function fetchGeographyByPeriod(period: Period) {
  return getGeographyByPeriod(period);
}

export async function fetchRetentionByPeriod(period: Period) {
  return getRetentionByPeriod(period);
}

export async function fetchDiscountImpactByPeriod(period: Period) {
  return getDiscountImpactByPeriod(period);
}

export async function fetchCancellationRateByPeriod(period: Period) {
  return getCancellationRateByPeriod(period);
}

export async function fetchReviewsByPeriod(period: Period) {
  return getReviewsByPeriod(period);
}

export async function fetchAvgDeliveryTime(period: Period) {
  return getAvgDeliveryTime(period);
}

export async function fetchPeakHoursByPeriod(period: Period) {
  return getPeakHoursByPeriod(period);
}

export async function fetchOrdersFunnel() {
  return getOrdersFunnel();
}

export async function fetchLowStockAlerts(limit = 10) {
  return getLowStockAlerts(limit);
}
