import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updatePosManagedProductUseCase } from "@/modules/adminCatalog/products/application/update-pos-managed-product.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

// ── PATCH: capa web de un producto del POS (`id` = slug del POS) ──────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return runAdminRoute(async () => {
    try {
      const { id } = await params;
      const body = await req.json();
      return NextResponse.json(await updatePosManagedProductUseCase(id, body));
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
