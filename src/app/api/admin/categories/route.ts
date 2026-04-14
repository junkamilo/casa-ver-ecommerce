import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";

function generateSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── GET: Listar categorías (con sus tipos de prenda asignados) ─────────────────

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
      return new NextResponse("Acceso denegado", { status: 403 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        isActive: true,
        order: true,
        _count: { select: { products: true } },
        garmentTypes: {
          select: {
            garmentType: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Aplanar la relación join para retornar array directo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = categories.map((cat: any) => ({
      ...cat,
      garmentTypes: (cat.garmentTypes ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (cgt: any) => cgt.garmentType
      ),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── POST: Crear categoría ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
      return new NextResponse("Acceso denegado", { status: 403 });

    const body = await req.json();
    const rawName: string = typeof body.name === "string" ? body.name.trim() : "";
    const image: string | undefined = body.image;
    const garmentTypeIds: string[] = Array.isArray(body.garmentTypeIds) ? body.garmentTypeIds : [];

    if (!rawName) return new NextResponse("El nombre es requerido", { status: 400 });
    if (rawName.length < 2)
      return new NextResponse("El nombre debe tener al menos 2 caracteres", { status: 400 });
    if (rawName.length > 100)
      return new NextResponse("El nombre no puede superar los 100 caracteres", { status: 400 });

    const slug = generateSlug(rawName);
    if (!slug) return new NextResponse("El nombre ingresado no genera un slug válido", { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) return new NextResponse("Esta categoría ya existe", { status: 409 });

    const maxOrderResult = await db.category.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrderResult._max.order ?? 0) + 1;

    const category = await db.category.create({
      data: {
        name: rawName,
        slug,
        image: image || null,
        order: nextOrder,
        garmentTypes: garmentTypeIds.length
          ? {
              create: garmentTypeIds.map((garmentTypeId: string) => ({ garmentTypeId })),
            }
          : undefined,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── PATCH: Editar / toggle categoría ──────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
      return new NextResponse("Acceso denegado", { status: 403 });

    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return new NextResponse("ID requerido", { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;

    // --- Toggle activo / inactivo ---
    if (body.action === "toggle") {
      const category = await db.category.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
      });

      if (!category) return new NextResponse("Categoría no encontrada", { status: 404 });

      if (category.isActive && category._count.products > 0) {
        return NextResponse.json(
          { error: "has_products", count: category._count.products, name: category.name },
          { status: 409 }
        );
      }

      const updated = await db.category.update({
        where: { id },
        data: { isActive: !category.isActive },
      });

      return NextResponse.json(updated);
    }

    // --- Editar nombre / imagen / tipos de prenda ---
    const rawName: string = typeof body.name === "string" ? body.name.trim() : "";
    const image: string | undefined = body.image;
    const garmentTypeIds: string[] = Array.isArray(body.garmentTypeIds) ? body.garmentTypeIds : [];

    if (!rawName) return new NextResponse("El nombre es requerido", { status: 400 });
    if (rawName.length < 2)
      return new NextResponse("El nombre debe tener al menos 2 caracteres", { status: 400 });
    if (rawName.length > 100)
      return new NextResponse("El nombre no puede superar los 100 caracteres", { status: 400 });

    const slug = generateSlug(rawName);
    if (!slug) return new NextResponse("El nombre ingresado no genera un slug válido", { status: 400 });

    const existing = await db.category.findFirst({ where: { slug, NOT: { id } } });
    if (existing) return new NextResponse("Esta categoría ya existe", { status: 409 });

    // Actualizar en transacción: datos + reemplazar relaciones de tipos de prenda
    const updated = await db.$transaction(async (tx: any) => {
      // Borrar relaciones anteriores y crear las nuevas
      await tx.categoryGarmentType.deleteMany({ where: { categoryId: id } });

      return tx.category.update({
        where: { id },
        data: {
          name: rawName,
          slug,
          image: image || null,
          garmentTypes: garmentTypeIds.length
            ? {
                create: garmentTypeIds.map((garmentTypeId: string) => ({ garmentTypeId })),
              }
            : undefined,
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[CATEGORIES_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
