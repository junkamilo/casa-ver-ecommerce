import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { PrismaProductDetailRepository } from "../infrastructure/prisma-product-detail.repository";
import {
  InvalidProductIdError,
  ProductError,
  ProductNotFoundError,
  ReviewNotAuthenticatedError,
  ReviewNotFoundError,
} from "./product.errors";
import type { ReviewActionResult } from "../contracts/product-detail.dto";

const repository = new PrismaProductDetailRepository();

function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id.length <= 50;
}

/**
 * Elimina la reseña del usuario autenticado para un producto.
 * Recálcula `rating` y `numReviews` en la misma transacción.
 *
 * Devuelve `{ success, error? }` para preservar el contrato consumido por
 * `ReviewForm.tsx`.
 */
export async function deleteReviewUseCase(
  productId: string,
): Promise<ReviewActionResult> {
  try {
    if (!isValidId(productId)) throw new InvalidProductIdError();

    const session = await auth();
    if (!session?.user?.email) throw new ReviewNotAuthenticatedError("delete");
    const userId = await repository.getUserIdByEmail(session.user.email);
    if (!userId) throw new ReviewNotAuthenticatedError("delete");

    const product = await repository.findProductSlugById(productId);
    if (!product) throw new ProductNotFoundError();

    const existing = await repository.findOwnReview(userId, productId);
    if (!existing) throw new ReviewNotFoundError();

    await repository.deleteReviewAndRecompute({
      reviewId: existing.id,
      productId,
    });

    revalidatePath(`/product/${product.slug}`);
    return { success: true };
  } catch (err) {
    if (err instanceof ProductError) {
      return { success: false, error: err.userMessage };
    }
    console.error(
      "[deleteReview]",
      err instanceof Error ? err.message : "Error desconocido",
    );
    return {
      success: false,
      error: "Error al eliminar la reseña. Intenta de nuevo.",
    };
  }
}
