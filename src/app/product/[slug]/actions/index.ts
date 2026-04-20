"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema, type ReviewInput } from "../validations";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Obtiene el userId real desde la sesión activa. Retorna null si no autenticado. */
async function getDbUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return dbUser?.id ?? null;
}

/** Valida formato básico de un CUID/ID de Prisma. Rechaza payloads maliciosos. */
function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id.length <= 50;
}

// ── saveReview ────────────────────────────────────────────────────────────────

export async function saveReview(
  productId: string,
  input: ReviewInput
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isValidId(productId)) {
      return { success: false, error: "Producto inválido" };
    }

    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Debes iniciar sesión para calificar" };

    const parsed = reviewSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { rating, comment } = parsed.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true, status: true },
    });
    if (!product) return { success: false, error: "Producto no encontrado" };
    if (product.status !== "ACTIVE") {
      return { success: false, error: "No puedes reseñar este producto" };
    }

    // Buscar orden PAID del usuario que contenga este producto
    const order = await prisma.order.findFirst({
      where: {
        userId,
        status: "PAID",
        items: { some: { productId } },
      },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });
    if (!order) {
      return { success: false, error: "Solo puedes reseñar productos que hayas comprado" };
    }
    const orderId = order.id;

    await prisma.$transaction(async (tx) => {
      await tx.review.upsert({
        where: { orderId_productId: { orderId, productId } },
        update: { rating, comment: comment ?? "" },
        create: { userId, productId, orderId, rating, comment: comment ?? "" },
      });

      const agg = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          rating: agg._avg.rating ?? 0,
          numReviews: agg._count.rating,
        },
      });
    });

    revalidatePath(`/product/${product.slug}`);
    return { success: true };
  } catch (err) {
    console.error("[saveReview]", err instanceof Error ? err.message : "Error desconocido");
    return { success: false, error: "Error al guardar la reseña. Intenta de nuevo." };
  }
}

// ── deleteReview ──────────────────────────────────────────────────────────────

export async function deleteReview(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isValidId(productId)) {
      return { success: false, error: "Producto inválido" };
    }

    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Debes iniciar sesión para eliminar tu reseña" };

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true },
    });
    if (!product) return { success: false, error: "Producto no encontrado" };

    const existing = await prisma.review.findFirst({
      where: { userId, productId },
      select: { id: true },
    });
    if (!existing) return { success: false, error: "No tienes una reseña para eliminar" };

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id: existing.id },
      });

      const agg = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          rating: agg._avg.rating ?? 0,
          numReviews: agg._count.rating,
        },
      });
    });

    revalidatePath(`/product/${product.slug}`);
    return { success: true };
  } catch (err) {
    console.error("[deleteReview]", err instanceof Error ? err.message : "Error desconocido");
    return { success: false, error: "Error al eliminar la reseña. Intenta de nuevo." };
  }
}
