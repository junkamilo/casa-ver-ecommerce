export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AdminReviewDTO {
  id: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  guestName: string | null;
  user: { name: string | null; email: string | null } | null;
  product: { id: string; name: string; slug: string };
  order: { orderNumber: string };
}

export type ReviewsQueryInputDTO = {
  status: "ALL" | ReviewStatus;
  search: string;
  page: number;
  limit: number;
};

export type ReviewsListResponseDTO = {
  reviews: AdminReviewDTO[];
  total: number;
  page: number;
  totalPages: number;
};
