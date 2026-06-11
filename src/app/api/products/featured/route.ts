import { NextResponse } from "next/server";
import { getFeaturedProductsUseCase } from "@/modules/collections/application/get-featured-products.use-case";

// ---------------------------------------------------------------------------
// GET /api/products/featured — Endpoint público (sin autenticación).
// Consumido por `BestSellersClient.tsx` con SWR (`refreshInterval: 60_000`).
// La lógica vive en `modules/collections/application/get-featured-products.use-case.ts`.
// ---------------------------------------------------------------------------
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getFeaturedProductsUseCase();
    return NextResponse.json(items);
  } catch (error) {
    console.error("[PRODUCTS_FEATURED_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
