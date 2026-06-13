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
          where: { product: { status: "ACTIVE" } },
          orderBy: { product: { name: "asc" } },
          select: {
            product: { select: { id: true, name: true, slug: true } },
          },
          take: 20,
        },
        garmentTypes: {
          orderBy: { garmentType: { order: "asc" } },
          include: { garmentType: { select: { id: true, name: true, slug: true, isActive: true } } },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = (categories as any[]).map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      subcategories: cat.subcategories,
      products: (cat.products ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (link: any) => link.product
      ),
      garmentTypes: (cat.garmentTypes ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((cgt: any) => cgt.garmentType?.isActive)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((cgt: any) => ({ id: cgt.garmentType.id, name: cgt.garmentType.name, slug: cgt.garmentType.slug })),
    }));

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
