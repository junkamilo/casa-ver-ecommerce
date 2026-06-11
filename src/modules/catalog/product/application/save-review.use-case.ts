import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { PrismaProductDetailRepository } from "../infrastructure/prisma-product-detail.repository";
import { reviewSchema, type ReviewInput } from "../contracts/review.schema";
import {
  InvalidProductIdError,
  ProductInactiveError,
  ProductNotFoundError,
  ReviewNotAuthenticatedError,
  ReviewNotPurchasedError,
  ReviewValidationError,
  ProductError,
} from "./product.errors";
import type { ReviewActionResult } from "../contracts/product-detail.dto";

const repository = new PrismaProductDetailRepository();

function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id.length <= 50;
}

/**
 * Guarda (upsert) la reseña de un producto para el usuario autenticado.
 * Reglas de negocio:
 *   - Usuario debe estar autenticado.
 *   - Solo puede reseñar si tiene una orden PAID que contiene el producto.
 *   - El producto debe existir y estar ACTIVE.
 *   - Recálcula `rating` y `numReviews` del producto en la misma transacción.
 *
 * Devuelve el contrato legacy `{ success, error? }` que consume `ReviewForm.tsx`.
 */
export async function saveReviewUseCase(
  productId: string,
  input: ReviewInput,
): Promise<ReviewActionResult> {
  try {
    if (!isValidId(productId)) throw new InvalidProductIdError();

    const session = await auth();
    if (!session?.user?.email) throw new ReviewNotAuthenticatedError("save");
    const userId = await repository.getUserIdByEmail(session.user.email);
    if (!userId) throw new ReviewNotAuthenticatedError("save");

    const parsed = reviewSchema.safeParse(input);
    if (!parsed.success) {
      throw new ReviewValidationError(parsed.error.issues[0].message);
    }
    const { rating, comment } = parsed.data;

    const product = await repository.findProductForReview(productId);
    if (!product) throw new ProductNotFoundError();
    if (product.status !== "ACTIVE") throw new ProductInactiveError();

    const order = await repository.findPaidOrderForProduct(userId, productId);
    if (!order) throw new ReviewNotPurchasedError();

    await repository.upsertReviewAndRecompute({
      userId,
      productId,
      orderId: order.id,
      rating,
      comment,
    });

    revalidatePath(`/product/${product.slug}`);
    return { success: true };
  } catch (err) {
    if (err instanceof ProductError) {
      return { success: false, error: err.userMessage };
    }
    console.error(
      "[saveReview]",
      err instanceof Error ? err.message : "Error desconocido",
    );
    return {
      success: false,
      error: "Error al guardar la reseña. Intenta de nuevo.",
    };
  }
}
