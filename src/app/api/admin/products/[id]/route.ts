import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { updateProductUseCase } from "@/modules/adminCatalog/products/application/update-product.use-case";
import { deleteProductUseCase } from "@/modules/adminCatalog/products/application/delete-product.use-case";
import { getProductByIdUseCase } from "@/modules/adminCatalog/products/application/get-product-by-id.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

// ── GET: Obtener producto completo por ID ─────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return runAdminRoute(async () => {
    try {
      const { id } = await params;
      const product = await getProductByIdUseCase(id);
      return NextResponse.json(product);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

// ── PATCH: Actualizar Producto completo ───────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return runAdminRoute(async () => {
    try {
      const { id } = await params;
      const body = await req.json();
      const result = await updateProductUseCase({ id, body });
      revalidatePath("/");
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

// ── DELETE: Eliminar Producto ─────────────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return runAdminRoute(async () => {
    try {
      const { id } = await params;
      const result = await deleteProductUseCase({ id });
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
