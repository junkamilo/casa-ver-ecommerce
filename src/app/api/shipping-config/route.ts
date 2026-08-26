import { NextResponse } from "next/server";
import { getShippingConfigFromDb } from "@/modules/shipping/infrastructure/prisma-shipping-config.repository";

/**
 * Configuración pública de envíos (solo umbral de envío gratis).
 * Usada por AnnouncementBar y superficies de tienda.
 */
export async function GET() {
  try {
    const config = await getShippingConfigFromDb();
    return NextResponse.json(
      {
        freeShippingThreshold: config?.freeShippingThreshold ?? 0,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json({ freeShippingThreshold: 0 }, { status: 200 });
  }
}
