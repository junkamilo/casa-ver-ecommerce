import { NextResponse } from "next/server";
import { listActiveCategoriesUseCase } from "@/modules/collections/application/list-active-categories.use-case";

// ---------------------------------------------------------------------------
// GET /api/categories — Endpoint público (sin autenticación).
// Devuelve solo categorías activas para la homepage y componentes públicos.
// La lógica vive en `modules/collections/application/list-active-categories.use-case.ts`.
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const categories = await listActiveCategoriesUseCase();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_PUBLIC_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
