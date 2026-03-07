import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: token.id as string },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const result = orders.map((o) => ({
    id:          o.id,
    orderNumber: o.orderNumber,
    status:      o.status,
    createdAt:   o.createdAt.toISOString(),
    updatedAt:   o.updatedAt.toISOString(),
    total:       Number(o.total),
    trackingCode: o.trackingNumber ?? undefined,
    shippingAddress: {
      fullName:   o.shippingName,
      address:    o.shippingAddress,
      city:       o.shippingCity,
      department: o.shippingDepartment,
    },
    items: o.items.map((item) => ({
      id:           item.id,
      productName:  item.name,
      productImage: item.imageUrl ?? "",
      color:        item.colorName,
      size:         item.size,
      quantity:     item.quantity,
      unitPrice:    Number(item.price),
    })),
  }));

  return NextResponse.json(result);
}
