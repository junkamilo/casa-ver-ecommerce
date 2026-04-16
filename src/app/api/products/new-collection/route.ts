import { NextResponse } from "next/server";
import { fetchNewProducts } from "@/components/layout/NewCollection/services/newCollectionService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchNewProducts();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[PRODUCTS_NEW_COLLECTION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
