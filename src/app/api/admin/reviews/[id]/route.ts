import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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
  const status = body.status as "PENDING" | "APPROVED" | "REJECTED";

  if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const review = await prisma.review.update({
    where: { id },
    data:  { status },
  });

  // Actualiza rating/numReviews del producto si cambia la visibilidad
  await recalcProductRating(review.productId);

  return NextResponse.json({ success: true, status: review.status });
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

  const review = await prisma.review.findUnique({ where: { id }, select: { productId: true } });
  if (!review) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  await prisma.review.delete({ where: { id } });
  await recalcProductRating(review.productId);

  return NextResponse.json({ success: true });
}

// Recalcula rating y numReviews del producto basado solo en reseñas APPROVED
async function recalcProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where:   { productId, status: "APPROVED" },
    _avg:    { rating: true },
    _count:  { id: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating:     agg._avg.rating ?? 0,
      numReviews: agg._count.id,
    },
  });
}
