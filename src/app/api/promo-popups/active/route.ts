import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { POPUP_PLACEMENTS, type PromoPopupPlacement } from "@/modules/posIntegration/contracts/pos-popups.schema";
import { fetchActivePopup } from "@/modules/posIntegration/infrastructure/pos-popups.client";

export const revalidate = 60;

// Popup vigente de una ubicación de la tienda (lo pide PromoPopupHost desde el navegador). Lo decide el POS
// (Diseño → Popups); si el POS no responde no se muestra ninguno.
export async function GET(req: NextRequest) {
  const placement = (new URL(req.url).searchParams.get("placement") ?? "").toUpperCase();
  if (!POPUP_PLACEMENTS.includes(placement as PromoPopupPlacement)) {
    return NextResponse.json({ message: "Ubicación inválida" }, { status: 400 });
  }

  let data = null;
  try {
    data = await fetchActivePopup(placement as PromoPopupPlacement);
  } catch (error) {
    console.warn("[promo-popups] POS sin respuesta:", error instanceof Error ? error.message : error);
  }
  return NextResponse.json(
    { data },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
  );
}
