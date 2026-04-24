import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getClientIP } from "@/lib/ratelimit";
import { getStockAlertsUseCase } from "@/modules/adminCatalog/stockAlerts/application/get-stock-alerts.use-case";
import { StockAlertRateLimitError } from "@/modules/adminCatalog/stockAlerts/application/stock-alert.errors";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

// GET — devuelve alertas de stock en tiempo real (optimizado con paginación)
export async function GET(request: NextRequest) {
  return runAdminRoute(async () => {
    const url = new URL(request.url);
    try {
      const ip = getClientIP(request);
      const result = await getStockAlertsUseCase({
        ip,
        page: Number(url.searchParams.get("page") || "1"),
        limit: Number(url.searchParams.get("limit") || "50"),
      });
      return NextResponse.json(result.payload, {
        headers:
          result.cache === "HIT"
            ? { "X-Cache": "HIT", "X-Cache-TTL": "300" }
            : { "X-Cache": "MISS" },
      });
    } catch (error) {
      if (error instanceof StockAlertRateLimitError) {
        return NextResponse.json(
          { message: error.message, code: "STOCK_ALERT_RATE_LIMIT" },
          {
            status: 429,
            headers: {
              "Retry-After": error.retryAfter,
              "X-RateLimit-Limit": error.limit,
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }
      return toErrorResponse(error);
    }
  });
}
