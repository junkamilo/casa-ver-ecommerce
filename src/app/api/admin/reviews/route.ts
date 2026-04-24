import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listReviewsUseCase } from "@/modules/adminCatalog/reviews/application/list-reviews.use-case";
import type { ReviewStatus } from "@/modules/adminCatalog/reviews/contracts/review.dto";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

// GET /api/admin/reviews?status=PENDING&page=1&search=
export async function GET(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const { searchParams } = new URL(req.url);
      const result = await listReviewsUseCase({
        status: (searchParams.get("status") ?? "ALL") as "ALL" | ReviewStatus,
        search: searchParams.get("search") ?? "",
        page: Number(searchParams.get("page") ?? "1"),
      });
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
