import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // cache 60s

export async function GET() {
  const orders = await prisma.order.findMany({
    where: { status: "PAID" },
    orderBy: { paidAt: "desc" },
    take: 20,
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

  // Recolectar slugs de productos únicos
  const productIds = [...new Set(orders.flatMap((o) => o.items.map((i) => i.productId)))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, slug: true },
  });
  const slugMap = Object.fromEntries(products.map((p) => [p.id, p.slug]));

  const now = Date.now();

  const result = orders
    .filter((o) => o.items.length > 0)
    .map((o) => {
      const item = o.items[0];
      const slug = slugMap[item.productId] ?? null;
      if (!slug) return null;

      // Nombre: primera palabra + inicial del apellido (ej: "María C.")
      const parts = (o.shippingName ?? "").trim().split(" ");
      const firstName = parts[0] ?? "Cliente";
      const lastInitial = parts[1] ? ` ${parts[1][0]}.` : "";
      const displayName = `${firstName}${lastInitial}`;

      // timeAgo
      const diffMs = now - new Date(o.paidAt!).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      let timeAgo: string;
      if (diffMin < 2) timeAgo = "hace 1 minuto";
      else if (diffMin < 60) timeAgo = `hace ${diffMin} minutos`;
      else {
        const diffH = Math.floor(diffMin / 60);
        timeAgo = diffH === 1 ? "hace 1 hora" : `hace ${diffH} horas`;
      }

      return {
        name: displayName,
        location: o.shippingCity,
        productName: item.name,
        timeAgo,
        image: item.imageUrl ?? null,
        slug,
      };
    })
    .filter(Boolean);

  return NextResponse.json(result);
}
