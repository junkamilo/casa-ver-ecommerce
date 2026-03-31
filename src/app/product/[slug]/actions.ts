"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema, type ReviewInput } from "./validations";

async function getDbUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return dbUser?.id ?? null;
}

export async function saveReview(
  productId: string,
  slug: string,
  input: ReviewInput
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!productId || typeof productId !== "string") {
      return { success: false, error: "Producto inválido" };
    }

    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Debes iniciar sesión para calificar" };

    const parsed = reviewSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { rating, comment } = parsed.data;

    await prisma.review.upsert({
      where: { userId_productId: { userId, productId } },
      update: { rating, comment },
      create: { userId, productId, rating, comment },
    });

    const agg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: agg._avg.rating ?? 0,
        numReviews: agg._count.rating,
      },
    });

    revalidatePath(`/product/${slug}`);
    return { success: true };
  } catch (err) {
    console.error("[saveReview]", err instanceof Error ? err.message : "Error desconocido");
    return { success: false, error: "Error al guardar la reseña. Intenta de nuevo." };
  }
}

export async function deleteReview(
  productId: string,
  slug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!productId || typeof productId !== "string") {
      return { success: false, error: "Producto inválido" };
    }

    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Debes iniciar sesión para eliminar tu reseña" };

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true },
    });
    if (!existing) return { success: false, error: "No tienes una reseña para eliminar" };

    await prisma.review.delete({ where: { userId_productId: { userId, productId } } });

    const agg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: agg._avg.rating ?? 0,
        numReviews: agg._count.rating,
      },
    });

    revalidatePath(`/product/${slug}`);
    return { success: true };
  } catch (err) {
    console.error("[deleteReview]", err instanceof Error ? err.message : "Error desconocido");
    return { success: false, error: "Error al eliminar la reseña. Intenta de nuevo." };
  }
}
