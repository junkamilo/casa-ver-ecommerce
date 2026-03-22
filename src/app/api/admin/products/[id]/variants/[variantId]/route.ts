import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";

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
    const { stock } = body;

    if (typeof stock !== "number" || stock < 0) {
      return new NextResponse(
        JSON.stringify({ error: "Stock debe ser un número no negativo" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variant = await (prisma as any).productVariant.findUnique({
      where: { id: variantId },
      include: { product: true, color: true },
    });

    if (!variant) {
      return new NextResponse("Variante no encontrada", { status: 404 });
    }

    if (variant.productId !== productId) {
      return new NextResponse("Variante no pertenece a este producto", {
        status: 400,
      });
    }

    // ✨ Actualizar el stock de la variante
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await (prisma as any).productVariant.update({
      where: { id: variantId },
      data: { stock },
      include: { color: true },
    });

    return NextResponse.json({
      id: updated.id,
      colorName: updated.color.name,
      size: updated.size,
      stock: updated.stock,
      minStock: updated.minStock,
      sku: updated.sku,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error("[VARIANT_STOCK_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
