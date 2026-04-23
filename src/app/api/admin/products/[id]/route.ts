import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { updateProductUseCase } from "@/modules/adminCatalog/products/application/update-product.use-case";
import { deleteProductUseCase } from "@/modules/adminCatalog/products/application/delete-product.use-case";
import { getProductByIdUseCase } from "@/modules/adminCatalog/products/application/get-product-by-id.use-case";
import {
  ProductNotFoundError,
  ProductValidationError,
} from "@/modules/adminCatalog/products/application/product.errors";

// ── GET: Obtener producto completo por ID ─────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }
    const { id } = await params;
    const product = await getProductByIdUseCase(id);
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return new NextResponse(error.message, { status: 404 });
    }
    console.error("[PRODUCT_GET_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── PATCH: Actualizar Producto completo ───────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }

    const { id } = await params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new NextResponse("Cuerpo de solicitud inválido", { status: 400 });
    }
    const result = await updateProductUseCase({ id, body });

    revalidatePath("/");
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ProductValidationError) {
      return new NextResponse(error.message, { status: 400 });
    }
    if (error instanceof ProductNotFoundError) {
      return new NextResponse(error.message, { status: 404 });
    }
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── DELETE: Eliminar Producto ─────────────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }

    const { id } = await params;

    const result = await deleteProductUseCase({ id });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return new NextResponse(error.message, { status: 404 });
    }
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
