import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/ratelimit";
import { listPosProductsUseCase } from "@/modules/adminCatalog/products/application/list-pos-products.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

// ── GET: productos que publica el POS, con la capa web ───────────────────────
// Los productos se crean, editan y borran en el POS (Tienda → Productos); la web no tiene POST ni DELETE.

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  const rl = await rateLimit(`${ip}:admin-products`, RATE_LIMIT_CONFIGS.admin);
  if (!rl.success) {
    return new NextResponse("Demasiadas solicitudes. Intenta de nuevo más tarde.", {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfter) },
    });
  }

  return runAdminRoute(async () => {
    try {
      return NextResponse.json(await listPosProductsUseCase());
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
