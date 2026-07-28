import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // cache 60s

/** Solo ventas de las últimas 48h — más allá daña la percepción de “actividad”. */
const MAX_AGE_MS = 48 * 60 * 60 * 1000;

function formatTimeAgo(diffMin: number): string {
  if (diffMin < 2) return "hace un momento";
  if (diffMin < 60) return `hace ${diffMin} minutos`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) {
    return diffH === 1 ? "hace 1 hora" : `hace ${diffH} horas`;
  }

  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "hace 1 día";
  // Dentro de 48h: máximo “hace 2 días”
  return "hace 2 días";
}

export async function GET() {
  const since = new Date(Date.now() - MAX_AGE_MS);

  const orders = await prisma.order.findMany({
    where: {
      status: "PAID",
      paidAt: { gte: since },
    },
    orderBy: { paidAt: "desc" },
    take: 12,
    select: {
      shippingName: true,
      shippingCity: true,
      paidAt: true,
      items: {
        take: 1,
        select: {
          name: true,
          imageUrl: true,
          productId: true,
        },
      },
    },
  });

  const productIds = [...new Set(orders.flatMap((o) => o.items.map((i) => i.productId)))];
  if (productIds.length === 0) {
    return NextResponse.json([]);
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, slug: true },
  });
  const slugMap = Object.fromEntries(products.map((p) => [p.id, p.slug]));

  const now = Date.now();

  const result = orders
    .filter((o) => o.items.length > 0 && o.paidAt)
    .map((o) => {
      const item = o.items[0];
      const slug = slugMap[item.productId] ?? null;
      if (!slug) return null;

      const parts = (o.shippingName ?? "").trim().split(" ");
      const firstName = parts[0] || "Cliente";
      const lastInitial = parts[1] ? ` ${parts[1][0]}.` : "";
      const displayName = `${firstName}${lastInitial}`;

      const diffMin = Math.floor((now - new Date(o.paidAt!).getTime()) / 60_000);

      return {
        name: displayName,
        location: o.shippingCity,
        productName: item.name,
        timeAgo: formatTimeAgo(diffMin),
        image: item.imageUrl ?? null,
        slug,
      };
    })
    .filter(Boolean);

  return NextResponse.json(result);
}
