import { NextResponse } from "next/server";
import { getActivePromotion } from "@/app/actions/promotions";

/**
 * GET /api/promotions/status
 * Endpoint público — devuelve el estado de la promoción activa.
 * No requiere autenticación (solo datos de lectura, sin PII).
 * Cache: revalidar cada 30 segundos para reducir carga en DB.
 */
export async function GET() {
  try {
    const promotion = await getActivePromotion();

    if (!promotion) {
      return NextResponse.json(
        { isAvailable: false },
        {
          status: 200,
          headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
        }
      );
    }

    return NextResponse.json(promotion, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json({ isAvailable: false }, { status: 500 });
  }
}
