import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  const { id } = await params;

  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) {
    return NextResponse.json(
      { message: "Dirección no encontrada" },
      { status: 404 }
    );
  }

  if (address.isDefault) {
    // Ya es predeterminada — no hacer nada
    return NextResponse.json({ success: true });
  }

  await prisma.$transaction(async (tx) => {
    await tx.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
    await tx.address.update({
      where: { id },
      data: { isDefault: true },
    });
  });

  return NextResponse.json({ success: true });
}
