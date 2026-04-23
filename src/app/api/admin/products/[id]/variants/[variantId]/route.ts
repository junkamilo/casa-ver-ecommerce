import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { updateProductVariantStockUseCase } from "@/modules/adminCatalog/products/application/update-product-variant-stock.use-case";
import {
  ProductNotFoundError,
  ProductOwnershipError,
  ProductValidationError,
} from "@/modules/adminCatalog/products/application/product.errors";

/**
 * PATCH /api/admin/products/[id]/variants/[variantId]
 * Actualizar el stock de una variante específica en tiempo real
 * ✨ Permite editar el inventario sin regenerar todas las variantes
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id: productId, variantId } = await params;
    const body = await req.json();
    const updated = await updateProductVariantStockUseCase({ productId, variantId, body });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ProductValidationError) {
      return new NextResponse(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }
    if (error instanceof ProductNotFoundError) {
      return new NextResponse(error.message, { status: 404 });
    }
    if (error instanceof ProductOwnershipError) {
      return new NextResponse(error.message, { status: 400 });
    }
    console.error("[VARIANT_STOCK_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
