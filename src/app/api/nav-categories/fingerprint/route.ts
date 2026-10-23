import { NextResponse } from "next/server";
import { getPosCategoryTree } from "@/modules/posIntegration/application/get-pos-categories.use-case";
import { posCategoryTreeSignature } from "@/modules/posIntegration/domain/pos-category-view";
import { NAV_CATEGORIES_CACHE_CONTROL } from "../cache-control";

// Firma del árbol de categorías del POS: el header solo vuelve a pedir el menú si cambia.
// Sin `force-dynamic`: los GET de route handlers ya son dinámicos (Next 15+); la CDN absorbe el sondeo
// con `s-maxage` y el webhook del POS purga el tag `pos-categories` tras un cambio real.
export async function GET() {
  const sig = posCategoryTreeSignature(await getPosCategoryTree());
  return NextResponse.json({ sig }, { headers: { "Cache-Control": NAV_CATEGORIES_CACHE_CONTROL } });
}
