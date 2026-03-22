import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const orders = await prisma.order.findMany({
    where: { userId },
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
