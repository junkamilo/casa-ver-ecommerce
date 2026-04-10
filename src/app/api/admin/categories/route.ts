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

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        isActive: true,
        order: true,
        _count: {
          select: { products: true },
        },
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }

    const body = await req.json();
    const rawName: string = typeof body.name === "string" ? body.name.trim() : "";
    const image: string | undefined = body.image;

    if (!rawName) {
      return new NextResponse("El nombre es requerido", { status: 400 });
    }
    if (rawName.length < 2) {
      return new NextResponse("El nombre debe tener al menos 2 caracteres", { status: 400 });
    }
    if (rawName.length > 100) {
      return new NextResponse("El nombre no puede superar los 100 caracteres", { status: 400 });
    }

    const slug = generateSlug(rawName);

    if (!slug) {
      return new NextResponse("El nombre ingresado no genera un slug válido", { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { slug } });

    if (existing) {
      return new NextResponse("Esta categoría ya existe", { status: 409 });
    }

    const maxOrderResult = await prisma.category.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrderResult._max.order ?? -1) + 1;

    const category = await prisma.category.create({
      data: {
        name: rawName,
        slug,
        image: image || null,
        order: nextOrder,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }

    const body = await req.json();

    // --- Intercambiar orden entre dos categorías ---
    if (body.action === "swap-orders") {
      const { id1, id2 } = body;
      if (!id1 || !id2) return new NextResponse("IDs requeridos", { status: 400 });

      const [cat1, cat2] = await Promise.all([
        prisma.category.findUnique({ where: { id: id1 }, select: { id: true, order: true } }),
        prisma.category.findUnique({ where: { id: id2 }, select: { id: true, order: true } }),
      ]);

      if (!cat1 || !cat2) return new NextResponse("Categoría no encontrada", { status: 404 });

      await prisma.$transaction([
        prisma.category.update({ where: { id: id1 }, data: { order: cat2.order } }),
        prisma.category.update({ where: { id: id2 }, data: { order: cat1.order } }),
      ]);

      return NextResponse.json({ ok: true });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return new NextResponse("ID requerido", { status: 400 });

    // --- Toggle activo / inactivo ---
    if (body.action === "toggle") {
      const category = await prisma.category.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
      });

      if (!category) return new NextResponse("Categoría no encontrada", { status: 404 });

      if (category.isActive && category._count.products > 0) {
        return NextResponse.json(
          {
            error: "has_products",
            count: category._count.products,
            name: category.name,
          },
          { status: 409 }
        );
      }

      const updated = await prisma.category.update({
        where: { id },
        data: { isActive: !category.isActive },
      });

      return NextResponse.json(updated);
    }

    // --- Editar nombre / imagen ---
    const rawName: string = typeof body.name === "string" ? body.name.trim() : "";
    const image: string | undefined = body.image;

    if (!rawName) {
      return new NextResponse("El nombre es requerido", { status: 400 });
    }
    if (rawName.length < 2) {
      return new NextResponse("El nombre debe tener al menos 2 caracteres", { status: 400 });
    }
    if (rawName.length > 100) {
      return new NextResponse("El nombre no puede superar los 100 caracteres", { status: 400 });
    }

    const slug = generateSlug(rawName);

    if (!slug) {
      return new NextResponse("El nombre ingresado no genera un slug válido", { status: 400 });
    }

    const existing = await prisma.category.findFirst({
      where: { slug, NOT: { id } },
    });

    if (existing) {
      return new NextResponse("Esta categoría ya existe", { status: 409 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: rawName,
        slug,
        image: image || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[CATEGORIES_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
