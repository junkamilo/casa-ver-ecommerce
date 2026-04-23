import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/ratelimit";
import { listProductsUseCase } from "@/modules/adminCatalog/products/application/list-products.use-case";
import { ProductValidationError } from "@/modules/adminCatalog/products/application/product.errors";
import { createProductUseCase } from "@/modules/adminCatalog/products/application/create-product.use-case";

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

  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }

    const url = new URL(request.url);
    const result = await listProductsUseCase({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ProductValidationError) {
      return new NextResponse(error.message, { status: 400 });
    }
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
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

  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new NextResponse("Cuerpo de solicitud inválido", { status: 400 });
    }
    const result = await createProductUseCase(body);

    revalidatePath("/");
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ProductValidationError) {
      return new NextResponse(error.message, { status: 400 });
    }
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
