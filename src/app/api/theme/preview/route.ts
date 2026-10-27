import { NextRequest, NextResponse } from "next/server";
import { buildThemeCssVariables } from "@/modules/posIntegration/contracts/pos-themes.schema";
import { fetchPreviewThemeTokens } from "@/modules/posIntegration/infrastructure/pos-theme.client";

/**
 * Previsualización de un tema desde el POS (`/?preview_theme_id=<uuid>`).
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")?.trim() ?? "";
  if (!/^[0-9a-fA-F-]{8,64}$/.test(id)) {
    return NextResponse.json({ error: "Identificador de tema inválido" }, { status: 400 });
  }

  const tokens = await fetchPreviewThemeTokens(id);
  if (!tokens) {
    return NextResponse.json({ data: null }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      tokens,
      css: buildThemeCssVariables(tokens),
    },
  });
}
