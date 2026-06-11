import type { ReviewsQueryInputDTO } from "../contracts/review.dto";
import { PrismaReviewRepository } from "../infrastructure/prisma-review.repository";
import { ReviewValidationError } from "./review.errors";

const reviewRepository = new PrismaReviewRepository();

export async function listReviewsUseCase(input: Partial<ReviewsQueryInputDTO>) {
  const status = input.status ?? "ALL";
  const search = input.search ?? "";
  const page = Math.max(1, Number(input.page ?? 1));
  const limit = 20;

  if (!["ALL", "PENDING", "APPROVED", "REJECTED"].includes(status)) {
    throw new ReviewValidationError("Estado inválido");
  }

  return reviewRepository.listReviews({
    status: status as ReviewsQueryInputDTO["status"],
    search,
    page,
    limit,
  });
}
