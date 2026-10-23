import { NextResponse } from "next/server";
import { getPosCategoryTree } from "@/modules/posIntegration/application/get-pos-categories.use-case";
import { toPosNavCategories } from "@/modules/posIntegration/domain/pos-category-view";
import { NAV_CATEGORIES_CACHE_CONTROL } from "./cache-control";

// Árbol del menú del header (polling): sale del POS, cacheado por tag y purgado por su webhook.
// Caché perimetral corta (ver ./cache-control.ts); el menú cambia poco.
export async function GET() {
  const tree = await getPosCategoryTree();
  return NextResponse.json(toPosNavCategories(tree), { headers: { "Cache-Control": NAV_CATEGORIES_CACHE_CONTROL } });
}
