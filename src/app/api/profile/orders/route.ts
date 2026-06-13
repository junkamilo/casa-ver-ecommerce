import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ORDER_PAGE_LIMIT = 50;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { message: "Sesión inválida. Cierra sesión e ingresa de nuevo." },
        { status: 401 }
      );
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
        subtotal:          true,
        shippingCost:      true,
        discount:          true,
        paymentMethod:     true,
        paidAt:            true,
        shippedAt:         true,
        deliveredAt:       true,
        trackingNumber:    true,
        shippingName:      true,
        shippingAddress:   true,
        shippingCity:      true,
        shippingDepartment: true,
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
      id:            o.id,
      orderNumber:   o.orderNumber,
      status:        o.status,
      createdAt:     o.createdAt.toISOString(),
      updatedAt:     o.updatedAt.toISOString(),
      total:         Number(o.total),
      subtotal:      Number(o.subtotal ?? 0),
      shippingCost:  Number(o.shippingCost ?? 0),
      discount:      Number(o.discount ?? 0),
      paymentMethod: o.paymentMethod ?? null,
      paidAt:        o.paidAt?.toISOString() ?? null,
      shippedAt:     o.shippedAt?.toISOString() ?? null,
      deliveredAt:   o.deliveredAt?.toISOString() ?? null,
      trackingCode:  o.trackingNumber ?? undefined,
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
