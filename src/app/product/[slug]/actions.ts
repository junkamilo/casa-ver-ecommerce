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
  const userId = await getDbUserId();
  if (!userId) return { success: false, error: "Debes iniciar sesión para calificar" };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { rating, comment } = parsed.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviewClient = prisma.review as any;

  await reviewClient.upsert({
    where: { userId_productId: { userId, productId } },
    update: { rating, comment },
    create: { userId, productId, rating, comment },
  });

  const agg = await reviewClient.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? 0,
      numReviews: agg._count.rating,
    },
  });

  revalidatePath(`/product/${slug}`);
  return { success: true };
}

export async function deleteReview(
  productId: string,
  slug: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await getDbUserId();
  if (!userId) return { success: false, error: "Debes iniciar sesión para eliminar tu reseña" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviewClient = prisma.review as any;

  const existing = await reviewClient.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
  if (!existing) return { success: false, error: "No tienes una reseña para eliminar" };

  await reviewClient.delete({ where: { userId_productId: { userId, productId } } });

  const agg = await reviewClient.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? 0,
      numReviews: agg._count.rating,
    },
  });

  revalidatePath(`/product/${slug}`);
  return { success: true };
}

