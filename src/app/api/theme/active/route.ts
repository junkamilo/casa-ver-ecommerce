import { NextResponse } from "next/server";
import { fetchActiveThemeTokens } from "@/modules/posIntegration/infrastructure/pos-theme.client";

/**
 * Entrega los tokens del tema actualmente activo en el POS (o el tema por defecto "Casa Verde").
 */
export async function GET() {
  const tokens = await fetchActiveThemeTokens();
  return NextResponse.json({ data: tokens });
}
