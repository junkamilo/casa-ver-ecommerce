import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Consulta ultraliviana — solo 2 agregados, sin joins
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [gtAgg, catAgg] = await Promise.all([
      prisma.garmentType.aggregate({
        _max: { updatedAt: true },
        _count: { id: true },
        where: { isActive: true },
      }),
      prisma.category.aggregate({
        _max: { updatedAt: true },
        _count: { id: true },
        where: { isActive: true, parentId: null },
      }),
    ]);

    const sig = [
      gtAgg._count.id,
      gtAgg._max.updatedAt?.getTime() ?? 0,
      catAgg._count.id,
      catAgg._max.updatedAt?.getTime() ?? 0,
    ].join("-");

    return NextResponse.json(
      { sig },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ sig: "" }, { status: 500 });
  }
}
