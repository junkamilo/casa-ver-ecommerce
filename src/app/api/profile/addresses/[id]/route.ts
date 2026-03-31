import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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
  updatedAt: true,
} as const;

const updateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Nombre requerido")
    .max(100, "Nombre muy largo")
    .optional(),

  cedula: z.preprocess(
    (v) => (v === "" ? null : v),
    z
      .string()
      .trim()
      .regex(/^\d{6,10}$/, "Cédula debe tener entre 6 y 10 dígitos numéricos")
      .nullable()
      .optional()
  ),

  phone: z
    .string()
    .trim()
    .min(7, "Teléfono inválido")
    .max(15, "Teléfono muy largo")
    .regex(/^\d+$/, "El teléfono solo puede contener números")
    .optional(),

  department: z
    .string()
    .trim()
    .min(2, "Departamento requerido")
    .max(100, "Departamento inválido")
    .optional(),

  city: z
    .string()
    .trim()
    .min(2, "Ciudad requerida")
    .max(100, "Ciudad inválida")
    .optional(),

  address: z
    .string()
    .trim()
    .min(5, "Dirección muy corta")
    .max(200, "Dirección muy larga")
    .optional(),

  addressDetail: z.preprocess(
    (v) => (v === "" ? null : v),
    z.string().trim().max(100, "Detalle muy largo").nullable().optional()
  ),

  zipCode: z.preprocess(
    (v) => (v === "" ? null : v),
    z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Código postal debe ser de 6 dígitos")
      .nullable()
      .optional()
  ),

  isDefault: z.boolean().optional(),
});

// Valida que el id de la URL tenga formato razonable antes de consultar la BD
function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.length >= 1 && id.length <= 40;
}

// Verifica propiedad: la dirección existe Y pertenece al usuario
async function getOwnAddress(id: string, userId: string) {
  const addr = await prisma.address.findUnique({ where: { id } });
  if (!addr || addr.userId !== userId) return null;
  return addr;
}

export async function PUT(
  req: NextRequest,
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

    const existing = await getOwnAddress(id, userId);
    if (!existing) {
      return NextResponse.json({ message: "Dirección no encontrada" }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Cuerpo de solicitud inválido" }, { status: 400 });
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
        select: ADDRESS_SELECT,
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Addresses:PUT]", error instanceof Error ? error.message : "Error desconocido");
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}

export async function DELETE(
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

    const existing = await getOwnAddress(id, userId);
    if (!existing) {
      return NextResponse.json({ message: "Dirección no encontrada" }, { status: 404 });
    }

    // Operación atómica: eliminar + promover default en una sola transacción
    await prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id } });

      if (existing.isDefault) {
        const next = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });
        if (next) {
          await tx.address.update({
            where: { id: next.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[Addresses:DELETE]", error instanceof Error ? error.message : "Error desconocido");
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
