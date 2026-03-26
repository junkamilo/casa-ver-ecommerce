import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const MAX_ADDRESSES = 5;

const addressSchema = z.object({
  fullName: z.string().min(2, "Nombre requerido"),
  cedula: z.string().optional(),
  phone: z
    .string()
    .min(7, "Teléfono inválido")
    .regex(/^\d+$/, "Solo números"),
  department: z.string().min(2, "Departamento requerido"),
  city: z.string().min(2, "Ciudad requerida"),
  address: z.string().min(5, "Dirección muy corta"),
  addressDetail: z.string().optional(),
  zipCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      fullName: true,
      cedula: true,
      phone: true,
      department: true,
      city: true,
      address: true,
      addressDetail: true,
      zipCode: true,
      isDefault: true,
      createdAt: true,
    },
  });

  return NextResponse.json(addresses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const count = await prisma.address.count({ where: { userId } });
  if (count >= MAX_ADDRESSES) {
    return NextResponse.json(
      { message: `Máximo ${MAX_ADDRESSES} direcciones permitidas` },
      { status: 400 }
    );
  }

  const { isDefault, ...data } = parsed.data;
  // Primera dirección → predeterminada automáticamente
  const shouldBeDefault = isDefault ?? count === 0;

  const address = await prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return tx.address.create({
      data: { ...data, userId, isDefault: shouldBeDefault },
    });
  });

  return NextResponse.json(address, { status: 201 });
}
