import type {
  ReviewStatus,
  ReviewsListResponseDTO,
} from "../contracts/review.dto";

const REVIEWS_API = "/api/admin/reviews";

type ApiErrorPayload = {
  error?: string;
  message?: string;
};

export class AdminReviewsApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminReviewsApiError";
    this.status = status;
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return text || null;
}

async function assertOk(response: Response): Promise<unknown> {
  const payload = await parseResponse(response);
  if (response.ok) return payload;

  const message =
    typeof payload === "string"
      ? payload
      : (payload as ApiErrorPayload | null)?.error ??
        (payload as ApiErrorPayload | null)?.message ??
        `HTTP ${response.status}`;

  throw new AdminReviewsApiError(message, response.status);
}

export async function fetchAdminReviews(params: {
  status: ReviewStatus | "ALL";
  search: string;
  page: number;
}): Promise<ReviewsListResponseDTO> {
  const searchParams = new URLSearchParams({
    status: params.status,
    search: params.search,
    page: String(params.page),
  });
  const response = await fetch(`${REVIEWS_API}?${searchParams}`);
  return (await assertOk(response)) as ReviewsListResponseDTO;
}

export async function updateAdminReviewStatus(id: string, status: ReviewStatus) {
  const response = await fetch(`${REVIEWS_API}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return assertOk(response);
}

export async function deleteAdminReview(id: string) {
  const response = await fetch(`${REVIEWS_API}/${id}`, { method: "DELETE" });
  return assertOk(response);
}
