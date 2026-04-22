import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/ratelimit";

const MAX_RESULTS = 12;

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);
  const rl = await rateLimit(`${ip}:search`, RATE_LIMIT_CONFIGS.search);

  if (!rl.success) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rl.retryAfter),
          "X-RateLimit-Limit": String(RATE_LIMIT_CONFIGS.search.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      // Imágenes generales del producto
      images: {
        where: { url: { not: "" } },
        take: 1,
        select: { url: true },
        orderBy: [{ isCover: "desc" }, { order: "asc" }],
      },
      // Fallback: primera imagen del primer color (mismo patrón que tienda)
      colors: {
        take: 6,
        select: {
          images: {
            where: { url: { not: "" } },
            take: 1,
            select: { url: true },
            orderBy: { order: "asc" },
          },
        },
      },
      // Fallback para conjuntos: primera imagen del primer item/color
      items: {
        take: 1,
        orderBy: { order: "asc" },
        select: {
          colors: {
            take: 1,
            select: {
              images: {
                where: { url: { not: "" } },
                take: 1,
                select: { url: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
    take: MAX_RESULTS,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  const results = products.map((p) => {
    const firstColorImage = p.colors.find((c) => c.images[0]?.url)?.images[0]?.url ?? null;
    const firstSetItemImage = p.items[0]?.colors[0]?.images[0]?.url ?? null;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.basePrice),
      image: p.images[0]?.url ?? firstColorImage ?? firstSetItemImage ?? null,
    };
  });

  return NextResponse.json(results);
}
