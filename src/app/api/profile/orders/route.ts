import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCustomerOrders } from "@/modules/orders/application/customer-orders";

/** «Mis pedidos»: el pago sale de la web y la logística (estado, guía, fechas y prendas) del POS. */
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

    const { orders } = await getCustomerOrders(userId);
    return NextResponse.json(orders);
  } catch (err) {
    console.error("[GET /api/profile/orders]", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
