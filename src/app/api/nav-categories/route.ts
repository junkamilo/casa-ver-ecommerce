import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Payload mínimo para el polling del header — no cachear
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { order: "asc" },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        },
        products: {
          where: { status: "ACTIVE" },
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
          take: 20,
        },
      },
    });

    const payload = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      subcategories: cat.subcategories,
      products: cat.products,
    }));

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
