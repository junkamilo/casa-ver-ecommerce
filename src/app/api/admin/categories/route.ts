import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        isActive: true,
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, image } = body;

    if (!name) return new NextResponse("Name is required", { status: 400 });

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return new NextResponse("Esta categoría ya existe", { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        image: image || null,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return new NextResponse("ID required", { status: 400 });

    const body = await req.json();

    if (body.action === "toggle") {
      const category = await prisma.category.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
      });

      if (!category) return new NextResponse("Not found", { status: 404 });

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

    const { name, image } = body;

    if (!name) return new NextResponse("Name is required", { status: 400 });

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await prisma.category.findFirst({
      where: { slug, NOT: { id } },
    });

    if (existing) {
      return new NextResponse("Esta categoría ya existe", { status: 409 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name,
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
