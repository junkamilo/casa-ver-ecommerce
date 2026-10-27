import { NextResponse } from "next/server";
import {
  getReviewToken,
  submitReviewByToken,
} from "@/modules/posIntegration/infrastructure/pos-reviews.client";

// Enlace del correo de solicitud de reseña (/resenas?token=...). El token, la reseña y su moderación viven en el
// POS (md/COMPARACION-TABLAS-RESENAS-POS-vs-WEB.md): esta ruta solo valida y reenvía.

const UNAVAILABLE = "No pudimos procesar tu reseña. Intenta de nuevo más tarde.";

/** 404 = enlace inválido; 409 del POS (usado o vencido) se responde 410 como antes. */
function errorStatus(status: number): number {
  return status === 409 ? 410 : status;
}

// GET /api/reviews/[token] — valida el token y devuelve el producto y el pedido
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  try {
    const result = await getReviewToken(token);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: errorStatus(result.status) });
    }
    const info = result.data;
    return NextResponse.json({
      productId: info.productSlug,
      productName: info.productName ?? info.productSlug,
      productSlug: info.productSlug,
      orderNumber: info.orderNumber,
      reviewerName: info.customerName ?? "",
    });
  } catch (error) {
    console.error("[reviews/token] POS sin respuesta:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503 });
  }
}

// POST /api/reviews/[token] — envía la reseña al POS (queda pendiente de moderación)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json().catch(() => ({}));
  const rating = Number(body.rating);
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

  try {
    const result = await submitReviewByToken(token, { rating: Math.round(rating), comment });
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: errorStatus(result.status) });
    }
    return NextResponse.json({ success: true, reviewId: result.data.reviewId });
  } catch (error) {
    console.error("[reviews/token] POS sin respuesta:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503 });
  }
}
