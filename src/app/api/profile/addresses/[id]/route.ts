import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  fullName: z.string().min(2, "Nombre requerido").optional(),
  cedula: z.string().nullable().optional(),
  phone: z
    .string()
    .min(7, "Teléfono inválido")
    .regex(/^\d+$/, "Solo números")
    .optional(),
  department: z.string().min(2, "Departamento requerido").optional(),
  city: z.string().min(2, "Ciudad requerida").optional(),
  address: z.string().min(5, "Dirección muy corta").optional(),
  addressDetail: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional(),
  isDefault: z.boolean().optional(),
});

async function getOwnAddress(id: string, userId: string) {
  const addr = await prisma.address.findUnique({ where: { id } });
  if (!addr || addr.userId !== userId) return null;
  return addr;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  const { id } = await params;

  const existing = await getOwnAddress(id, userId);
  if (!existing) {
    return NextResponse.json(
      { message: "Dirección no encontrada" },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { isDefault, ...data } = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    if (isDefault === true) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return tx.address.update({
      where: { id },
      data: {
        ...data,
        ...(isDefault !== undefined ? { isDefault } : {}),
      },
    });
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  const { id } = await params;

  const existing = await getOwnAddress(id, userId);
  if (!existing) {
    return NextResponse.json(
      { message: "Dirección no encontrada" },
      { status: 404 }
    );
  }

  await prisma.address.delete({ where: { id } });

  // Si era la predeterminada, promover la más reciente que queda
  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await prisma.address.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  return new NextResponse(null, { status: 204 });
}
