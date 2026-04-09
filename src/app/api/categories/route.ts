import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET /api/categories — Endpoint público (sin autenticación)
// Devuelve solo categorías activas para la homepage y componentes públicos.
// No incluye datos administrativos (_count, isActive).
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        isActive: true,
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_PUBLIC_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
