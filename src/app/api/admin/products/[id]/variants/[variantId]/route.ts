import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateProductVariantStockUseCase } from "@/modules/adminCatalog/products/application/update-product-variant-stock.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

/**
 * PATCH /api/admin/products/[id]/variants/[variantId]
 * Actualizar el stock de una variante específica en tiempo real
 * ✨ Permite editar el inventario sin regenerar todas las variantes
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  return runAdminRoute(async () => {
    try {
      const { id: productId, variantId } = await params;
      const body = await req.json();
      const updated = await updateProductVariantStockUseCase({ productId, variantId, body });
      return NextResponse.json(updated);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
