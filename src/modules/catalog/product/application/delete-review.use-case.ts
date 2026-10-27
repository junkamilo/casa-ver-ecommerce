import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { deleteOwnReview } from "@/modules/posIntegration/infrastructure/pos-reviews.client";
import {
  InvalidProductIdError,
  ProductError,
  ReviewNotAuthenticatedError,
  ReviewNotFoundError,
} from "./product.errors";
import type { ReviewActionResult } from "../contracts/product-detail.dto";

function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id.length <= 200;
}

/**
 * Elimina en el POS la reseña de la clienta autenticada para un producto (por su slug y su correo).
 *
 * Devuelve `{ success, error? }` para preservar el contrato consumido por
 * `ReviewForm.tsx`.
 */
export async function deleteReviewUseCase(
  productSlug: string,
): Promise<ReviewActionResult> {
  try {
    if (!isValidId(productSlug)) throw new InvalidProductIdError();

    const session = await auth();
    if (!session?.user?.email) throw new ReviewNotAuthenticatedError("delete");
    const deleted = await deleteOwnReview(productSlug, session.user.email);
    if (!deleted) throw new ReviewNotFoundError();

    revalidatePath(`/product/${productSlug}`);
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
