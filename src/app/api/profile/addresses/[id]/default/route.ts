import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.length >= 1 && id.length <= 40;
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) {
      return NextResponse.json({ message: "Dirección no encontrada" }, { status: 404 });
    }

    // Ya es predeterminada — respuesta idempotente sin tocar la BD
    if (address.isDefault) {
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
  } catch (error) {
    console.error("[Addresses:PATCH]", error instanceof Error ? error.message : "Error desconocido");
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
