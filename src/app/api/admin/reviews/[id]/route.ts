import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteReviewUseCase } from "@/modules/adminCatalog/reviews/application/delete-review.use-case";
import { updateReviewStatusUseCase } from "@/modules/adminCatalog/reviews/application/update-review-status.use-case";
import {
  ReviewNotFoundError,
  ReviewValidationError,
} from "@/modules/adminCatalog/reviews/application/review.errors";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") return false;
  return true;
}

// PATCH /api/admin/reviews/[id] — cambia status (APPROVED | REJECTED | PENDING)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body   = await request.json();
  try {
    const result = await updateReviewStatusUseCase({ id, status: body.status });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ReviewValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[Admin/Reviews PATCH]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE /api/admin/reviews/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const result = await deleteReviewUseCase(id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ReviewNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("[Admin/Reviews DELETE]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
