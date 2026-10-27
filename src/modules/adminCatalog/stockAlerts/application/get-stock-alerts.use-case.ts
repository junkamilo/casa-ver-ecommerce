import { RATE_LIMIT_CONFIGS, rateLimit } from "@/lib/ratelimit";
import type { StockAlertsQueryDTO, StockAlertsResponseDTO } from "../contracts/stock-alert.dto";
import { listPosCatalogForAlerts } from "./pos-stock-alerts";
import {
  STOCK_ALERT_CACHE_TTL,
  StockAlertCacheRepository,
} from "../infrastructure/stock-alert-cache.repository";
import { StockAlertRateLimitError, StockAlertValidationError } from "./stock-alert.errors";

const stockAlertCacheRepository = new StockAlertCacheRepository();

export async function getStockAlertsUseCase(input: { ip: string; page?: number; limit?: number }) {
  const rl = await rateLimit(`${input.ip}:stock-alerts`, RATE_LIMIT_CONFIGS.stockAlerts);
  if (!rl.success) {
    throw new StockAlertRateLimitError(rl.retryAfter, RATE_LIMIT_CONFIGS.stockAlerts.limit);
  }

  const query: StockAlertsQueryDTO = {
    page: Math.max(1, Number(input.page ?? 1)),
    limit: Math.min(100, Math.max(1, Number(input.limit ?? 50))),
  };
  if (!Number.isFinite(query.page) || !Number.isFinite(query.limit)) {
    throw new StockAlertValidationError("Parámetros inválidos");
  }

  const cached = await stockAlertCacheRepository.get(query);
  if (cached) {
    return { payload: cached, cache: "HIT" as const, ttl: STOCK_ALERT_CACHE_TTL };
  }

  // Inventario del POS (la web ya no guarda stock): prenda agotada o un color agotado en todas sus tallas.
  const catalog = await listPosCatalogForAlerts();
  const totalProducts = catalog.length;
  const pageProducts = catalog.slice((query.page - 1) * query.limit, query.page * query.limit);

  const alerts: StockAlertsResponseDTO["alerts"] = [];
  for (const product of pageProducts) {
    if (product.variants.length === 0) continue;
    if (!product.available) {
      alerts.push({ type: "product", productId: product.slug, productName: product.name });
      continue;
    }
    for (const color of product.colors) {
      const variants = product.variants.filter((v) => v.colorId === color.colorId);
      if (variants.length > 0 && variants.every((v) => !v.available)) {
        alerts.push({
          type: "color",
          productId: product.slug,
          productName: product.name,
          colorId: String(color.colorId),
          colorName: color.name,
        });
      }
    }
  }

  const payload: StockAlertsResponseDTO = {
    alerts,
    total: alerts.length,
    pagination: {
      page: query.page,
      limit: query.limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / query.limit),
      hasNextPage: query.page < Math.ceil(totalProducts / query.limit),
    },
  };

  await stockAlertCacheRepository.set(query, payload);
  return { payload, cache: "MISS" as const };
}
