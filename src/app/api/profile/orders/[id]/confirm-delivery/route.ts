import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

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

    // Valida que el id sea un string no vacío
    if (!id || typeof id !== "string") {
      return NextResponse.json({ message: "ID de pedido inválido" }, { status: 400 });
    }

    // Consulta sólo los campos necesarios para la validación
    const order = await prisma.order.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Pedido no encontrado" }, { status: 404 });
    }

    // Verifica que el pedido pertenezca al usuario autenticado
    if (order.userId !== userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    if (order.status !== "SHIPPED") {
      return NextResponse.json(
        { message: "Solo puedes confirmar un pedido que esté en camino" },
        { status: 400 }
      );
    }

    await prisma.order.update({
      where: { id },
      data: { status: "DELIVERED", deliveredAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/profile/orders/[id]/confirm-delivery]", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
