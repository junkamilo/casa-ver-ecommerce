import { RATE_LIMIT_CONFIGS, rateLimit } from "@/lib/ratelimit";
import type { StockAlertsQueryDTO, StockAlertsResponseDTO } from "../contracts/stock-alert.dto";
import { PrismaStockAlertRepository } from "../infrastructure/prisma-stock-alert.repository";
import {
  STOCK_ALERT_CACHE_TTL,
  StockAlertCacheRepository,
} from "../infrastructure/stock-alert-cache.repository";
import { StockAlertRateLimitError, StockAlertValidationError } from "./stock-alert.errors";

const stockAlertRepository = new PrismaStockAlertRepository();
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

  const [products, totalProducts] = await Promise.all([
    stockAlertRepository.getActiveProductsWithColors(query),
    stockAlertRepository.countActiveProducts(),
  ]);

  type ProductColor = { id: string; name: string; variants: { stock: number }[] };
  type ProductWithColors = { id: string; name: string; colors: ProductColor[] };

  const alerts: StockAlertsResponseDTO["alerts"] = [];
  for (const product of products as ProductWithColors[]) {
    const colorsWithVariants = product.colors.filter((c) => c.variants.length > 0);
    if (colorsWithVariants.length === 0) continue;

    const productTotalStock = colorsWithVariants.reduce(
      (acc, c) => acc + c.variants.reduce((s, v) => s + v.stock, 0),
      0
    );

    if (productTotalStock === 0) {
      alerts.push({ type: "product", productId: product.id, productName: product.name });
      continue;
    }

    for (const color of colorsWithVariants) {
      const colorStock = color.variants.reduce((s, v) => s + v.stock, 0);
      if (colorStock === 0) {
        alerts.push({
          type: "color",
          productId: product.id,
          productName: product.name,
          colorId: color.id,
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
