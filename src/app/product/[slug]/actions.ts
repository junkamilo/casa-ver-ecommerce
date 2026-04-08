"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema, type ReviewInput } from "./validations";

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
    // 1. Validar formato del ID (no confiar en el cliente)
    if (!isValidId(productId)) {
      return { success: false, error: "Producto inválido" };
    }

    // 2. Verificar sesión
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Debes iniciar sesión para calificar" };

    // 3. Validar input con Zod (rating 1-5, comment sin HTML, max 500)
    const parsed = reviewSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { rating, comment } = parsed.data;

    // 4. Verificar que el producto existe y está activo en la BD
    //    — el slug viene de la BD, nunca del cliente, para evitar invalidación de rutas arbitrarias
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true, status: true },
    });
    if (!product) return { success: false, error: "Producto no encontrado" };
    if (product.status !== "ACTIVE") {
      return { success: false, error: "No puedes reseñar este producto" };
    }

    // 5. Upsert + recalcular rating en transacción atómica
    await prisma.$transaction(async (tx) => {
      await tx.review.upsert({
        where: { userId_productId: { userId, productId } },
        update: { rating, comment: comment ?? null },
        create: { userId, productId, rating, comment: comment ?? null },
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
    // 1. Validar formato del ID
    if (!isValidId(productId)) {
      return { success: false, error: "Producto inválido" };
    }

    // 2. Verificar sesión
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Debes iniciar sesión para eliminar tu reseña" };

    // 3. Verificar que el producto existe en la BD y obtener slug
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true },
    });
    if (!product) return { success: false, error: "Producto no encontrado" };

    // 4. Verificar que la reseña pertenece al usuario
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true },
    });
    if (!existing) return { success: false, error: "No tienes una reseña para eliminar" };

    // 5. Eliminar + recalcular rating en transacción atómica
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { userId_productId: { userId, productId } },
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
