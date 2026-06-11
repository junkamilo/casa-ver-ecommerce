import { NextResponse } from "next/server";
import { getNewProductsUseCase } from "@/modules/collections/application/get-new-products.use-case";

// ---------------------------------------------------------------------------
// GET /api/products/new-collection — Endpoint público (sin autenticación).
// Consumido por `NewCollectionClient.tsx` con SWR (`refreshInterval: 60_000`).
// La lógica vive en `modules/collections/application/get-new-products.use-case.ts`.
// ---------------------------------------------------------------------------
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getNewProductsUseCase();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[PRODUCTS_NEW_COLLECTION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
