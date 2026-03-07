import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    return NextResponse.json({ message: "Pedido no encontrado" }, { status: 404 });
  }

  if (order.userId !== token.id) {
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
