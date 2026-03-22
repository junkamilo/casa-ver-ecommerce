import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    return NextResponse.json({ message: "Pedido no encontrado" }, { status: 404 });
  }

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
}
