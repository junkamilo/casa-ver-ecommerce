import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Máximo de pedidos devueltos por consulta — evita exponer volúmenes ilimitados de datos.
const ORDER_PAGE_LIMIT = 50;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      select: {
        id:                true,
        orderNumber:       true,
        status:            true,
        createdAt:         true,
        updatedAt:         true,
        total:             true,
        trackingNumber:    true,
        shippingName:      true,
        shippingAddress:   true,
        shippingCity:      true,
        shippingDepartment: true,
        // Sólo los campos necesarios de cada item — nunca el variantId interno
        items: {
          select: {
            id:        true,
            name:      true,
            imageUrl:  true,
            colorName: true,
            size:      true,
            quantity:  true,
            price:     true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: ORDER_PAGE_LIMIT,
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
  } catch (err) {
    console.error("[GET /api/profile/orders]", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
