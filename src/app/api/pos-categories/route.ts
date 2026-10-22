import { NextResponse } from "next/server";
import { getPosCategoryTree } from "@/modules/posIntegration/application/get-pos-categories.use-case";
import { toPosCarouselItems, toPosNavCategories } from "@/modules/posIntegration/domain/pos-category-view";

// GET /api/pos-categories — categorías publicadas por el POS (consultadas desde el servidor con X-Api-Key).
//   sin parámetros   → categorías principales para el carrusel del home
//   ?format=nav      → árbol para el menú del header
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const format = new URL(req.url).searchParams.get("format");
  try {
    const tree = await getPosCategoryTree();
    const payload = format === "nav" ? toPosNavCategories(tree) : toPosCarouselItems(tree);
    return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[POS_CATEGORIES_GET]", error);
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
