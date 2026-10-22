import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { PrismaProductDetailRepository } from "../infrastructure/prisma-product-detail.repository";
import { reviewSchema, type ReviewInput } from "../contracts/review.schema";
import {
  InvalidProductIdError,
  ProductNotFoundError,
  ReviewNotAuthenticatedError,
  ReviewNotPurchasedError,
  ReviewValidationError,
  ProductError,
} from "./product.errors";
import type { ReviewActionResult } from "../contracts/product-detail.dto";
import { resolveProductSource } from "./resolve-product-source";

const repository = new PrismaProductDetailRepository();

function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id.length <= 200;
}

/**
 * Producto reseñable por su slug: activo en el POS o en la web. Devuelve su nombre (se guarda en la
 * reseña). Los pedidos lo identifican por el mismo slug.
 */
async function findReviewableProduct(slug: string): Promise<{ name: string } | null> {
  const resolved = await resolveProductSource(slug);
  if (!resolved) return null;
  if (resolved.source === "POS") return { name: resolved.pos.name.trim() };
  const legacy = await repository.getProductForSeo(slug);
  return legacy ? { name: legacy.name } : null;
}

/**
 * Guarda (upsert) la reseña de un producto para el usuario autenticado.
 * Reglas de negocio:
 *   - Usuario debe estar autenticado.
 *   - Solo puede reseñar si tiene una orden PAID que contiene el producto.
 *   - El producto debe existir y estar activo (en el POS o en la web).
 *   - `productSlug`: el `id` del producto en el PDP, que es su slug.
 *   - Recálcula `rating` y `numReviews` del producto en la misma transacción.
 *
 * Devuelve el contrato legacy `{ success, error? }` que consume `ReviewForm.tsx`.
 */
export async function saveReviewUseCase(
  productSlug: string,
  input: ReviewInput,
): Promise<ReviewActionResult> {
  try {
    if (!isValidId(productSlug)) throw new InvalidProductIdError();

    const session = await auth();
    if (!session?.user?.email) throw new ReviewNotAuthenticatedError("save");
    const userId = await repository.getUserIdByEmail(session.user.email);
    if (!userId) throw new ReviewNotAuthenticatedError("save");

    const parsed = reviewSchema.safeParse(input);
    if (!parsed.success) {
      throw new ReviewValidationError(parsed.error.issues[0].message);
    }
    const { rating, comment } = parsed.data;

    const product = await findReviewableProduct(productSlug);
    if (!product) throw new ProductNotFoundError();

    const order = await repository.findPaidOrderForProduct(userId, [productSlug]);
    if (!order) throw new ReviewNotPurchasedError();

    await repository.upsertReviewAndRecompute({
      userId,
      productSlug,
      productName: product.name,
      orderId: order.id,
      rating,
      comment,
    });

    revalidatePath(`/product/${productSlug}`);
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
