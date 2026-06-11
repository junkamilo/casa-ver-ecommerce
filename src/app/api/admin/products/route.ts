import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/ratelimit";
import { listProductsUseCase } from "@/modules/adminCatalog/products/application/list-products.use-case";
import { createProductUseCase } from "@/modules/adminCatalog/products/application/create-product.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

// ── GET: Listar Productos (con paginación) ───────────────────────────────────

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
      const url = new URL(request.url);
      const result = await listProductsUseCase({
        page: url.searchParams.get("page") ?? undefined,
        limit: url.searchParams.get("limit") ?? undefined,
      });
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

// ── POST: Crear Producto completo ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const rl = await rateLimit(`${ip}:admin-products`, RATE_LIMIT_CONFIGS.admin);
  if (!rl.success) {
    return new NextResponse("Demasiadas solicitudes. Intenta de nuevo más tarde.", {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfter) },
    });
  }

  return runAdminRoute(async () => {
    try {
      const body = await req.json();
      const result = await createProductUseCase(body);
      revalidatePath("/");
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
