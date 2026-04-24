import { NextResponse } from "next/server";
import { deleteReviewUseCase } from "@/modules/adminCatalog/reviews/application/delete-review.use-case";
import { updateReviewStatusUseCase } from "@/modules/adminCatalog/reviews/application/update-review-status.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

// PATCH /api/admin/reviews/[id] — cambia status (APPROVED | REJECTED | PENDING)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return runAdminRoute(async () => {
    const { id } = await params;
    try {
      const body = await request.json();
      const result = await updateReviewStatusUseCase({ id, status: body.status });
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

// DELETE /api/admin/reviews/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return runAdminRoute(async () => {
    const { id } = await params;
    try {
      const result = await deleteReviewUseCase(id);
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
