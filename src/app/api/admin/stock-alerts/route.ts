import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/ratelimit";
import { Redis } from "@upstash/redis";

const CACHE_TTL = 300; // 5 minutos

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return false;
  return true;
}

export interface StockAlert {
  type: "product" | "color";
  productId: string;
  productName: string;
  colorId?: string;
  colorName?: string;
}

// GET — devuelve alertas de stock en tiempo real (optimizado con paginación)
export async function GET(request: NextRequest) {
  // ✅ RATE LIMITING: máximo 20 requests por minuto
  const ip = getClientIP(request);
  const rateLimitResult = await rateLimit(`${ip}:stock-alerts`, RATE_LIMIT_CONFIGS.stockAlerts);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfter),
          "X-RateLimit-Limit": String(RATE_LIMIT_CONFIGS.stockAlerts.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  if (!(await verifyAdmin())) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  // Paginación: URL params ?page=1&limit=50
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "50")); // Max 50 por request
  const skip = (page - 1) * limit;

  // Caché Redis — 5 minutos (stock cambia poco entre requests del admin)
  const redis = getRedis();
  const cacheKey = `stock-alerts:p${page}:l${limit}`;
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "X-Cache": "HIT", "X-Cache-TTL": String(CACHE_TTL) },
      });
    }
  }

  // OPTIMIZACIÓN: Agregar TAKE para limitar memoria
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      colors: {
        select: {
          id: true,
          name: true,
          variants: { select: { stock: true } },
        },
      },
    },
    take: limit,        // ✅ MÁXIMO 50 productos por request
    skip: skip,         // ✅ Permite paginación
    orderBy: { name: "asc" }, // Orden consistente
  });

  // Obtener total de productos para cálculo de páginas
  const totalProducts = await prisma.product.count({
    where: { status: "ACTIVE" },
  });

  const alerts: StockAlert[] = [];

  // Calcular alertas (ahora máximo 50 productos = máximo 50*10 colores máximo)
  for (const product of products) {
    const colorsWithVariants = product.colors.filter((c) => c.variants.length > 0);
    if (colorsWithVariants.length === 0) continue;

    const productTotalStock = colorsWithVariants.reduce(
      (acc, c) => acc + c.variants.reduce((s, v) => s + v.stock, 0),
      0
    );

    if (productTotalStock === 0) {
      // Toda la prenda agotada — una sola alerta por producto
      alerts.push({ type: "product", productId: product.id, productName: product.name });
    } else {
      // Solo colores agotados dentro de una prenda que aún tiene stock
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
  }

  const responseBody = {
    alerts,
    total: alerts.length,
    pagination: {
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      hasNextPage: page < Math.ceil(totalProducts / limit),
    },
  };

  if (redis) {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(responseBody)).catch(() => {});
  }

  return NextResponse.json(responseBody, {
    headers: { "X-Cache": "MISS" },
  });
}
