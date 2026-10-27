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
import { submitProductReview } from "@/modules/posIntegration/infrastructure/pos-reviews.client";

const repository = new PrismaProductDetailRepository();

function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id.length <= 200;
}

/**
 * Producto reseñable por su slug: publicado en el POS. Devuelve su nombre (va con la reseña). Los pedidos lo
 * identifican por el mismo slug.
 */
async function findReviewableProduct(slug: string): Promise<{ name: string } | null> {
  const resolved = await resolveProductSource(slug);
  return resolved ? { name: resolved.pos.name.trim() } : null;
}

/**
 * Envía al POS la reseña de un producto de la clienta autenticada (md/COMPARACION-TABLAS-RESENAS-POS-vs-WEB.md).
 * Reglas de negocio:
 *   - La clienta debe estar autenticada.
 *   - Solo puede reseñar si tiene un pedido pagado con el producto (compra verificada en la web).
 *   - El producto debe estar publicado en el POS.
 *   - `productSlug`: el `id` del producto en el PDP, que es su slug.
 *   - Queda pendiente hasta que se apruebe en el POS (Diseño → Reseñas); volver a enviarla la edita.
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
    const user = await repository.getUserByEmail(session.user.email);
    if (!user) throw new ReviewNotAuthenticatedError("save");

    const parsed = reviewSchema.safeParse(input);
    if (!parsed.success) {
      throw new ReviewValidationError(parsed.error.issues[0].message);
    }
    const { rating, comment } = parsed.data;

    const product = await findReviewableProduct(productSlug);
    if (!product) throw new ProductNotFoundError();

    const order = await repository.findPaidOrderForProduct(user.id, productSlug);
    if (!order) throw new ReviewNotPurchasedError();

    const result = await submitProductReview({
      orderNumber: order.orderNumber,
      productSlug,
      productName: product.name,
      customerName: user.name?.trim() || order.shippingName?.trim() || "Clienta",
      customerEmail: session.user.email,
      rating,
      comment: comment ?? "",
    });
    if (!result.ok) throw new ReviewValidationError(result.message);

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
