import { NextResponse } from "next/server";
import { getPosColors } from "@/modules/posIntegration/application/get-pos-colors.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

// ── GET: Colores del POS (solo lectura) ────────────────────────────────────────
// Los colores se crean, editan y desactivan en el POS; la web ya no tiene tabla propia. El formulario de
// productos de la web los usa como paleta. Sin integración o sin respuesta del POS: lista vacía.

export async function GET() {
  return runAdminRoute(async () => {
    try {
      const colors = await getPosColors();
      return NextResponse.json(
        colors.map((color) => ({ id: String(color.colorId), name: color.name, hexCode: color.hexCode, isActive: true })),
      );
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
