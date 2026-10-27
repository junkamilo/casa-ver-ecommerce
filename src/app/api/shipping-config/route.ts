import { NextResponse } from "next/server";
import { getShippingTerms } from "@/modules/shipping/application/pos-shipping";
import { isPosCatalogConfigured } from "@/modules/posIntegration/infrastructure/pos-catalog.client";

/**
 * Condiciones públicas de envío gratis (monto y si está activo), tal como las publica el POS.
 * Usada por AnnouncementBar y superficies de tienda.
 */
export async function GET() {
  try {
    const terms = isPosCatalogConfigured()
      ? await getShippingTerms()
      : { freeShippingThreshold: 0, freeShippingActive: false };
    return NextResponse.json(terms, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json({ freeShippingThreshold: 0, freeShippingActive: false }, { status: 200 });
  }
}
