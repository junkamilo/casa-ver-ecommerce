import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
    return new NextResponse("Acceso denegado", { status: 403 });
  return null;
}

// ── GET: Listar colores ────────────────────────────────────────────────────────
// ?active=true  → solo los activos (usado por el formulario de productos)

export async function GET(req: NextRequest) {
  try {
    const deny = await requireAdmin();
    if (deny) return deny;

    const onlyActive = new URL(req.url).searchParams.get("active") === "true";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const colors = await db.color.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(colors);
  } catch (error) {
    console.error("[COLORS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── POST: Crear color ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const deny = await requireAdmin();
    if (deny) return deny;

    const body = await req.json();
    const name: string = typeof body.name === "string" ? body.name.trim() : "";
    const hexCode: string = typeof body.hexCode === "string" ? body.hexCode.trim() : "";

    if (!name) return new NextResponse("El nombre es requerido", { status: 400 });
    if (name.length < 2) return new NextResponse("El nombre debe tener al menos 2 caracteres", { status: 400 });
    if (name.length > 60) return new NextResponse("El nombre no puede superar los 60 caracteres", { status: 400 });
    if (!hexCode) return new NextResponse("El código de color es requerido", { status: 400 });
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hexCode))
      return new NextResponse("El código de color debe ser un valor hexadecimal válido (ej: #FF0000)", { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const existing = await db.color.findUnique({ where: { name } });
    if (existing) return new NextResponse("Ya existe un color con ese nombre", { status: 409 });

    const color = await db.color.create({ data: { name, hexCode } });
    return NextResponse.json(color, { status: 201 });
  } catch (error) {
    console.error("[COLORS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── PATCH: Editar o toggle activo ──────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const deny = await requireAdmin();
    if (deny) return deny;

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return new NextResponse("ID requerido", { status: 400 });

    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;

    if (body.action === "toggle") {
      const color = await db.color.findUnique({ where: { id } });
      if (!color) return new NextResponse("Color no encontrado", { status: 404 });
      const updated = await db.color.update({ where: { id }, data: { isActive: !color.isActive } });
      return NextResponse.json(updated);
    }

    const name: string = typeof body.name === "string" ? body.name.trim() : "";
    const hexCode: string = typeof body.hexCode === "string" ? body.hexCode.trim() : "";

    if (!name) return new NextResponse("El nombre es requerido", { status: 400 });
    if (name.length < 2) return new NextResponse("El nombre debe tener al menos 2 caracteres", { status: 400 });
    if (name.length > 60) return new NextResponse("El nombre no puede superar los 60 caracteres", { status: 400 });
    if (!hexCode) return new NextResponse("El código de color es requerido", { status: 400 });
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hexCode))
      return new NextResponse("El código de color debe ser un valor hexadecimal válido (ej: #FF0000)", { status: 400 });

    const duplicate = await db.color.findFirst({ where: { name, NOT: { id } } });
    if (duplicate) return new NextResponse("Ya existe un color con ese nombre", { status: 409 });

    const updated = await db.color.update({ where: { id }, data: { name, hexCode } });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[COLORS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── DELETE: Eliminar color ─────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const deny = await requireAdmin();
    if (deny) return deny;

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return new NextResponse("ID requerido", { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const color = await db.color.findUnique({ where: { id } });
    if (!color) return new NextResponse("Color no encontrado", { status: 404 });

    await db.color.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[COLORS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
