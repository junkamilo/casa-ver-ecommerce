import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";

function generateSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // quitar acentos
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── GET: Listar todos los tipos de prenda ─────────────────────────────────────

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
      return new NextResponse("Acceso denegado", { status: 403 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const garmentTypes = await db.garmentType.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        order: true,
        isActive: true,
        _count: { select: { products: true, categories: true } },
      },
    });

    return NextResponse.json(garmentTypes);
  } catch (error) {
    console.error("[GARMENT_TYPES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── POST: Crear tipo de prenda ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
      return new NextResponse("Acceso denegado", { status: 403 });

    const body = await req.json();
    const rawName: string = typeof body.name === "string" ? body.name.trim() : "";

    if (!rawName || rawName.length < 2)
      return new NextResponse("El nombre debe tener al menos 2 caracteres", { status: 400 });
    if (rawName.length > 80)
      return new NextResponse("El nombre no puede superar 80 caracteres", { status: 400 });

    const slug = generateSlug(rawName);
    if (!slug) return new NextResponse("Nombre inválido", { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const existing = await db.garmentType.findUnique({ where: { slug } });
    if (existing) return new NextResponse("Este tipo de prenda ya existe", { status: 409 });

    const maxOrder = await db.garmentType.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? 0) + 1;

    const created = await db.garmentType.create({
      data: { name: rawName, slug, order: nextOrder },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("[GARMENT_TYPES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── PATCH: Editar nombre o toggle activo ──────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
      return new NextResponse("Acceso denegado", { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return new NextResponse("ID requerido", { status: 400 });

    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;

    // Toggle activo / inactivo
    if (body.action === "toggle") {
      const current = await db.garmentType.findUnique({ where: { id } });
      if (!current) return new NextResponse("No encontrado", { status: 404 });

      const updated = await db.garmentType.update({
        where: { id },
        data: { isActive: !current.isActive },
      });
      return NextResponse.json(updated);
    }

    // Editar nombre
    const rawName: string = typeof body.name === "string" ? body.name.trim() : "";
    if (!rawName || rawName.length < 2)
      return new NextResponse("El nombre debe tener al menos 2 caracteres", { status: 400 });
    if (rawName.length > 80)
      return new NextResponse("El nombre no puede superar 80 caracteres", { status: 400 });

    const slug = generateSlug(rawName);
    const duplicate = await db.garmentType.findFirst({ where: { slug, NOT: { id } } });
    if (duplicate) return new NextResponse("Este tipo de prenda ya existe", { status: 409 });

    const updated = await db.garmentType.update({
      where: { id },
      data: { name: rawName, slug },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[GARMENT_TYPES_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── DELETE: Eliminar (solo si sin productos) ──────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
      return new NextResponse("Acceso denegado", { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return new NextResponse("ID requerido", { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const gt = await db.garmentType.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!gt) return new NextResponse("No encontrado", { status: 404 });

    const total = gt._count.products;
    if (total > 0) {
      return NextResponse.json(
        { error: "has_products", count: total, name: gt.name },
        { status: 409 }
      );
    }

    await db.garmentType.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[GARMENT_TYPES_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
