export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ReviewsQueryInputDTO = {
  status: "ALL" | ReviewStatus;
  search: string;
  page: number;
  limit: number;
};

export type ReviewsListResponseDTO = {
  reviews: unknown[];
  total: number;
  page: number;
  totalPages: number;
};
