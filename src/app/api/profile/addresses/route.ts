import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const MAX_ADDRESSES = 5;

// Campos que el cliente puede leer — userId nunca se devuelve
const ADDRESS_SELECT = {
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
} as const;

const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Nombre requerido (mínimo 2 caracteres)")
    .max(100, "Nombre muy largo"),

  // Cédula colombiana: 6–10 dígitos, campo opcional
  cedula: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z
      .string()
      .trim()
      .regex(/^\d{6,10}$/, "Cédula debe tener entre 6 y 10 dígitos numéricos")
      .optional()
  ),

  phone: z
    .string()
    .trim()
    .min(7, "Teléfono inválido")
    .max(15, "Teléfono muy largo")
    .regex(/^\d+$/, "El teléfono solo puede contener números"),

  department: z
    .string()
    .trim()
    .min(2, "Departamento requerido")
    .max(100, "Departamento inválido"),

  city: z
    .string()
    .trim()
    .min(2, "Ciudad requerida")
    .max(100, "Ciudad inválida"),

  address: z
    .string()
    .trim()
    .min(5, "Dirección muy corta (mínimo 5 caracteres)")
    .max(200, "Dirección muy larga (máximo 200 caracteres)"),

  addressDetail: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().trim().max(100, "Detalle muy largo").optional()
  ),

  // Código postal colombiano: 6 dígitos, campo opcional
  zipCode: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Código postal debe ser de 6 dígitos")
      .optional()
  ),

  isDefault: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const userId = (session.user as { id?: string }).id as string;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      select: ADDRESS_SELECT,
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("[Addresses:GET]", error instanceof Error ? error.message : "Error desconocido");
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const userId = (session.user as { id?: string }).id as string;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Cuerpo de solicitud inválido" }, { status: 400 });
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
        select: ADDRESS_SELECT,
      });
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error("[Addresses:POST]", error instanceof Error ? error.message : "Error desconocido");
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
