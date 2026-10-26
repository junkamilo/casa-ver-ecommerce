import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { confirmCustomerDelivery } from "@/modules/orders/application/customer-orders";
import type { NextRequest } from "next/server";

/** «Ya recibí mi pedido»: el POS lo marca entregado y confirmado por el cliente (la web no lo guarda). */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ message: "ID de pedido inválido" }, { status: 400 });
    }

    const result = await confirmCustomerDelivery(userId, id);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/profile/orders/[id]/confirm-delivery]", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
