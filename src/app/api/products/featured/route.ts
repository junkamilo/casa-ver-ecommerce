import { NextResponse } from "next/server";
import { fetchFeaturedProducts } from "@/components/layout/BestSellers/services";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await fetchFeaturedProducts();
    return NextResponse.json(items);
  } catch (error) {
    console.error("[PRODUCTS_FEATURED_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
