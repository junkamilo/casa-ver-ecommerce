import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getClientIP } from "@/lib/ratelimit";
import { getStockAlertsUseCase } from "@/modules/adminCatalog/stockAlerts/application/get-stock-alerts.use-case";
import { StockAlertRateLimitError } from "@/modules/adminCatalog/stockAlerts/application/stock-alert.errors";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return false;
  return true;
}

// GET — devuelve alertas de stock en tiempo real (optimizado con paginación)
export async function GET(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

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
        { error: error.message },
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
    console.error("[STOCK_ALERTS_GET]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
