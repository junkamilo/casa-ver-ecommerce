import { NextResponse } from "next/server";
import { listActiveCategoriesUseCase } from "@/modules/collections/application/list-active-categories.use-case";

// GET /api/categories — Endpoint público: categorías principales publicadas por el POS.
export async function GET() {
  const categories = await listActiveCategoriesUseCase();
  return NextResponse.json(categories, { headers: { "Cache-Control": "no-store" } });
}
