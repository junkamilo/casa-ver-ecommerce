import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_RESULTS = 12;

export async function GET(req: NextRequest) {
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
    take: MAX_RESULTS,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  const results = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.basePrice),
    image: p.images[0]?.url ?? p.colors[0]?.images[0]?.url ?? null,
  }));

  return NextResponse.json(results);
}
