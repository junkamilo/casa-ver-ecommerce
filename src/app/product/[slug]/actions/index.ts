"use server";

// ─────────────────────────────────────────────────────────────────────────────
// Thin re-exports de las Server Actions del PDP. La lógica vive en
// `modules/catalog/product/application/`.
//
// Se preserva la firma original (`saveReview`, `deleteReview`) para no romper
// los formularios que las invocan (`ReviewForm.tsx`).
// ─────────────────────────────────────────────────────────────────────────────

import type { ReviewInput } from "@/modules/catalog/product/contracts/review.schema";
import type { ReviewActionResult } from "@/modules/catalog/product/contracts/product-detail.dto";
import { saveReviewUseCase } from "@/modules/catalog/product/application/save-review.use-case";
import { deleteReviewUseCase } from "@/modules/catalog/product/application/delete-review.use-case";

export async function saveReview(
  productId: string,
  input: ReviewInput,
): Promise<ReviewActionResult> {
  return saveReviewUseCase(productId, input);
}

export async function deleteReview(
  productId: string,
): Promise<ReviewActionResult> {
  return deleteReviewUseCase(productId);
}
