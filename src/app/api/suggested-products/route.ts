import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Siempre fresco tras marcar/desmarcar en admin (evita servir [] cacheado). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

type SuggestedProductRow = {
  name: string;
  slug: string;
  basePrice: { toNumber(): number } | number;
  isSet: boolean;
  images: Array<{ url: string }>;
  colors: Array<{ images: Array<{ url: string }> }>;
  items: Array<{
    price: { toNumber(): number } | number | null;
    colors: Array<{ images: Array<{ url: string }> }>;
  }>;
};

function toNumber(value: { toNumber(): number } | number | null | undefined): number | null {
  if (value == null) return null;
  return typeof value === "number" ? value : value.toNumber();
}

function mapSuggestedProduct(p: SuggestedProductRow) {
  const coverFromImages = p.images[0]?.url ?? null;
  const coverFromColor = p.colors[0]?.images[0]?.url ?? null;
  const coverFromItem = p.items[0]?.colors[0]?.images[0]?.url ?? null;
  const image = coverFromImages || coverFromColor || coverFromItem || null;

  const itemPrices = p.isSet
    ? p.items
        .map((item) => toNumber(item.price))
        .filter((price): price is number => price != null && price > 0)
    : [];
  const minPrice = itemPrices.length > 0 ? Math.min(...itemPrices) : null;
  const price = toNumber(p.basePrice) ?? 0;

  return {
    name: p.name,
    slug: p.slug,
    price,
    minPrice: p.isSet ? minPrice : null,
    image,
    isSet: p.isSet,
  };
}

export async function GET(request: NextRequest) {
  const excludeSlug = request.nextUrl.searchParams.get("excludeSlug")?.trim() || null;

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      isSuggested: true,
      ...(excludeSlug ? { slug: { not: excludeSlug } } : {}),
    },
    orderBy: [{ suggestedAt: "desc" }, { updatedAt: "desc" }],
    take: 12,
    select: {
      name: true,
      slug: true,
      basePrice: true,
      isSet: true,
      images: {
        where: { colorId: null },
        orderBy: [{ isCover: "desc" }, { order: "asc" }],
        take: 1,
        select: { url: true },
      },
      colors: {
        take: 1,
        include: {
          images: {
            orderBy: [{ isCover: "desc" }, { order: "asc" }],
            take: 1,
            select: { url: true },
          },
        },
      },
      items: {
        orderBy: { order: "asc" },
        take: 6,
        select: {
          price: true,
          colors: {
            take: 1,
            include: {
              images: {
                orderBy: [{ isCover: "desc" }, { order: "asc" }],
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json(products.map(mapSuggestedProduct));
}
