import type { ReviewStatus } from "../contracts/review.dto";

export const REVIEW_STATUSES: ReviewStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export function isValidReviewStatus(status: unknown): status is ReviewStatus {
  return typeof status === "string" && REVIEW_STATUSES.includes(status as ReviewStatus);
}
