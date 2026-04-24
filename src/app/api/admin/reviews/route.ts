import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { listReviewsUseCase } from "@/modules/adminCatalog/reviews/application/list-reviews.use-case";
import { ReviewValidationError } from "@/modules/adminCatalog/reviews/application/review.errors";
import type { ReviewStatus } from "@/modules/adminCatalog/reviews/contracts/review.dto";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") return false;
  return true;
}

// GET /api/admin/reviews?status=PENDING&page=1&search=
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const result = await listReviewsUseCase({
      status: (searchParams.get("status") ?? "ALL") as "ALL" | ReviewStatus,
      search: searchParams.get("search") ?? "",
      page: Number(searchParams.get("page") ?? "1"),
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ReviewValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[Admin/Reviews GET]", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
