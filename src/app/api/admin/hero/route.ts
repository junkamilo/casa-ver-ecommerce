import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

function isValidCloudinaryUrl(v: unknown): boolean {
  if (typeof v !== "string" || !v.trim()) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && u.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return new NextResponse("Acceso denegado", { status: 403 });
  }
  return null;
}

// GET /api/admin/hero — público, devuelve slides activos ordenados
export async function GET() {
  const slides = await db.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
  });
  return NextResponse.json(slides);
}

// POST /api/admin/hero — crea un nuevo slide al final
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { mediaUrl, mediaType, headline, subheadline } = body;

  if (!isValidCloudinaryUrl(mediaUrl)) {
    return NextResponse.json({ error: "URL de media inválida" }, { status: 400 });
  }
  if (!["image", "video"].includes(mediaType)) {
    return NextResponse.json({ error: "mediaType debe ser 'image' o 'video'" }, { status: 400 });
  }

  // Calcula la siguiente posición libre
  const last = await db.heroSlide.findFirst({ orderBy: { position: "desc" } });
  const nextPosition = (last?.position ?? 0) + 1;

  const slide = await db.heroSlide.create({
    data: {
      position: nextPosition,
      mediaUrl,
      mediaType,
      headline: headline || null,
      subheadline: subheadline || null,
    },
  });

  return NextResponse.json(slide, { status: 201 });
}

// PUT /api/admin/hero — actualiza un slide por id
export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { id, mediaUrl, mediaType, headline, subheadline } = body;

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }
  if (mediaUrl !== undefined && mediaUrl !== "" && !isValidCloudinaryUrl(mediaUrl)) {
    return NextResponse.json({ error: "URL de media inválida" }, { status: 400 });
  }
  if (mediaType !== undefined && !["image", "video"].includes(mediaType)) {
    return NextResponse.json({ error: "mediaType inválido" }, { status: 400 });
  }

  const slide = await db.heroSlide.update({
    where: { id },
    data: {
      ...(mediaUrl !== undefined && { mediaUrl }),
      ...(mediaType !== undefined && { mediaType }),
      ...(headline !== undefined && { headline: headline || null }),
      ...(subheadline !== undefined && { subheadline: subheadline || null }),
    },
  });

  return NextResponse.json(slide);
}

// DELETE /api/admin/hero?id=xxx — elimina un slide
export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  await db.heroSlide.delete({ where: { id } });

  // Re-numera posiciones para mantener secuencia sin huecos
  const remaining = await db.heroSlide.findMany({ orderBy: { position: "asc" } });
  await Promise.all(
    remaining.map((s: { id: string }, i: number) =>
      db.heroSlide.update({ where: { id: s.id }, data: { position: i + 1 } })
    )
  );

  return NextResponse.json({ ok: true });
}
