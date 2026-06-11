import { isValidReviewStatus } from "../domain/review.entity";
import { PrismaReviewRepository } from "../infrastructure/prisma-review.repository";
import { ReviewValidationError } from "./review.errors";

const reviewRepository = new PrismaReviewRepository();

export async function updateReviewStatusUseCase(input: { id: string; status: unknown }) {
  if (!isValidReviewStatus(input.status)) {
    throw new ReviewValidationError("Estado inválido");
  }

  const review = await reviewRepository.updateReviewStatus(input.id, input.status);
  await reviewRepository.recalcProductRating(review.productId);
  return { success: true, status: review.status };
}
