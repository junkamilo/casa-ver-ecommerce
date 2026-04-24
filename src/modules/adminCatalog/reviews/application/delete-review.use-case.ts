import { PrismaReviewRepository } from "../infrastructure/prisma-review.repository";
import { ReviewNotFoundError } from "./review.errors";

const reviewRepository = new PrismaReviewRepository();

export async function deleteReviewUseCase(id: string) {
  const review = await reviewRepository.findReviewProduct(id);
  if (!review) {
    throw new ReviewNotFoundError("No encontrada");
  }

  await reviewRepository.deleteReview(id);
  await reviewRepository.recalcProductRating(review.productId);
  return { success: true };
}
