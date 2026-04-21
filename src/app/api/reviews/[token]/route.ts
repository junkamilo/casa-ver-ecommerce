import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reviews/[token] — valida token y devuelve info del producto/orden
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const review = await prisma.review.findUnique({
    where: { reviewToken: token },
    include: {
      product: { select: { id: true, name: true, slug: true } },
      order:   { select: { orderNumber: true } },
      user:    { select: { name: true } },
    },
  });

  if (!review) {
    return NextResponse.json({ error: "Enlace inválido" }, { status: 404 });
  }
  if (review.reviewTokenUsed) {
    return NextResponse.json({ error: "Este enlace ya fue utilizado" }, { status: 410 });
  }
  if (review.reviewTokenExpiresAt && review.reviewTokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "Este enlace ha expirado" }, { status: 410 });
  }

  return NextResponse.json({
    reviewId:      review.id,
    productId:     review.product.id,
    productName:   review.product.name,
    productSlug:   review.product.slug,
    orderNumber:   review.order.orderNumber,
    reviewerName:  review.user?.name || review.guestName || "",
  });
}

// POST /api/reviews/[token] — guarda la reseña
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const review = await prisma.review.findUnique({
    where: { reviewToken: token },
  });

  if (!review) {
    return NextResponse.json({ error: "Enlace inválido" }, { status: 404 });
  }
  if (review.reviewTokenUsed) {
    return NextResponse.json({ error: "Este enlace ya fue utilizado" }, { status: 410 });
  }
  if (review.reviewTokenExpiresAt && review.reviewTokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "Este enlace ha expirado" }, { status: 410 });
  }

  const body = await request.json();
  const rating  = Number(body.rating);
  const comment = String(body.comment ?? "").trim();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Calificación inválida (1-5)" }, { status: 400 });
  }
  if (!comment || comment.length < 5) {
    return NextResponse.json({ error: "El comentario es muy corto" }, { status: 400 });
  }
  if (comment.length > 1000) {
    return NextResponse.json({ error: "El comentario es muy largo (máx. 1000 caracteres)" }, { status: 400 });
  }

  const updated = await prisma.review.update({
    where: { id: review.id },
    data: {
      rating,
      comment,
      status:          "PENDING",
      reviewTokenUsed: true,
    },
  });

  return NextResponse.json({ success: true, reviewId: updated.id });
}
