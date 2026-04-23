import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/ratelimit";

const MAX_RESULTS = 12;

function isVideoUrl(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return [".mp4", ".webm", ".mov", ".ogg"].some((ext) => clean.endsWith(ext));
}

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
      isSet: true,
      videoUrl: true,
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
      // Conjuntos: precios en ítems (min) + primera imagen del primer ítem/color
      items: {
        orderBy: { order: "asc" },
        select: {
          price: true,
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
    const rawImage = p.images[0]?.url ?? firstColorImage ?? firstSetItemImage ?? null;

    const itemPrices: number[] =
      p.isSet && p.items?.length
        ? p.items
            .map((it) => (it.price != null ? Number(it.price) : null))
            .filter((v): v is number => v !== null && !Number.isNaN(v))
        : [];
    const minPrice =
      p.isSet && itemPrices.length >= 2
        ? (() => {
            const lo = Math.min(...itemPrices);
            const hi = Math.max(...itemPrices);
            return lo !== hi ? lo : null;
          })()
        : null;
    const baseNum = Number(p.basePrice);
    const allItemsSamePrice =
      p.isSet && itemPrices.length > 0 && itemPrices.every((v) => v === itemPrices[0]);
    const displayPrice =
      p.isSet && baseNum === 0 && allItemsSamePrice ? itemPrices[0]! : baseNum;

    const hasProductVideo = !!(p.videoUrl && p.videoUrl.trim());

    // En el buscador no se reproduce video: si la portada es video, no enviar miniatura
    // (evita mostrar foto de otro color/item o intentar usar URL de video como imagen).
    const useVideoPlaceholder =
      hasProductVideo ||
      (rawImage !== null && isVideoUrl(rawImage));

    const image = useVideoPlaceholder ? null : rawImage;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: displayPrice,
      isSet: p.isSet,
      minPrice,
      image,
      coverVideo: useVideoPlaceholder,
    };
  });

  return NextResponse.json(results);
}
