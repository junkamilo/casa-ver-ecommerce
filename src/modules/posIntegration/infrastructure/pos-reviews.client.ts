import "server-only";
import type { z } from "zod";
import {
  posOwnReviewSchema,
  posProductReviewsSchema,
  posPublicReviewSchema,
  posReviewDeletedSchema,
  posReviewRequestResultSchema,
  posReviewSubmitResultSchema,
  posReviewTokenSchema,
  type PosOwnReview,
  type PosProductReviews,
  type PosPublicReview,
  type PosReviewToken,
} from "../contracts/pos-reviews.schema";
import { normalizePosSlug } from "../domain/pos-mapper";
import { PosApiError } from "./pos-catalog.client";
import { getPosApiConfig } from "./pos-config";

// Reseñas en el POS (md/COMPARACION-TABLAS-RESENAS-POS-vs-WEB.md). Las lecturas de la vitrina van por la Data
// Cache de Next (tags `pos-reviews` / `pos-reviews-<slug>`, que purga el aviso `review` del POS); el resto
// (enlaces del correo, envío y reseña propia) va sin caché.

const REQUEST_TIMEOUT_MS = 8_000;
const REVALIDATE_SECONDS = 3600;

export const POS_REVIEWS_CACHE_TAG = "pos-reviews";
export const posReviewsCacheTag = (slug: string) => `pos-reviews-${normalizePosSlug(slug)}`;

/** Respuesta del POS: `ok` con los datos, o el código y mensaje con que la rechazó (4xx). */
export type PosReviewResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

async function call<T extends z.ZodTypeAny>(
  path: string,
  schema: T,
  init: { method?: "GET" | "POST"; body?: unknown; next?: { tags: string[]; revalidate: number } } = {},
): Promise<PosReviewResult<z.infer<T>>> {
  const { baseUrl, apiKey } = getPosApiConfig();
  const url = `${baseUrl.replace(/\/catalog$/, "")}/reviews${path}`;
  const response = await fetch(url, {
    method: init.method ?? "GET",
    headers: {
      "X-Api-Key": apiKey,
      Accept: "application/json",
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    ...(init.next ? { next: init.next } : { cache: "no-store" as const }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const json = await response.json().catch(() => null);
  if (response.status === 401) throw new PosApiError("Clave de integración del POS inválida", 401);
  if (response.status >= 400 && response.status < 500) {
    const details = Array.isArray(json?.details) && json.details.length > 0 ? ` (${json.details.join("; ")})` : "";
    return { ok: false, status: response.status, message: `${json?.message ?? `POS respondió ${response.status}`}${details}` };
  }
  if (!response.ok) throw new PosApiError(`POS respondió ${response.status} en /reviews${path}`, response.status);

  const parsed = schema.safeParse(json?.data);
  if (!parsed.success) {
    throw new PosApiError(`Respuesta inesperada del POS en /reviews${path}: ${parsed.error.issues[0]?.message}`, 502);
  }
  return { ok: true, data: parsed.data };
}

function unwrap<T>(result: PosReviewResult<T>): T {
  if (!result.ok) throw new PosApiError(result.message, result.status);
  return result.data;
}

/** Reseñas aprobadas, promedio y reparto de un producto (para pintar la ficha). */
export async function fetchProductReviewsForRender(slug: string): Promise<PosProductReviews> {
  const normalized = normalizePosSlug(slug);
  return unwrap(
    await call(`/product/${encodeURIComponent(normalized)}`, posProductReviewsSchema, {
      next: { tags: [POS_REVIEWS_CACHE_TAG, posReviewsCacheTag(normalized)], revalidate: REVALIDATE_SECONDS },
    }),
  );
}

/** Testimonios del inicio: aprobadas de 4 y 5 estrellas. */
export async function fetchTestimonialsForRender(limit: number): Promise<PosPublicReview[]> {
  return unwrap(
    await call(`/testimonials?limit=${limit}`, posPublicReviewSchema.array(), {
      next: { tags: [POS_REVIEWS_CACHE_TAG], revalidate: REVALIDATE_SECONDS },
    }),
  );
}

/** Enlace del correo de solicitud de un producto de un pedido entregado (409 = ya la envió). */
export function requestReviewLink(body: { orderNumber: string; productSlug: string; productName?: string | null }) {
  return call("/requests", posReviewRequestResultSchema, { method: "POST", body });
}

export function getReviewToken(token: string): Promise<PosReviewResult<PosReviewToken>> {
  return call(`/token/${encodeURIComponent(token)}`, posReviewTokenSchema);
}

export function submitReviewByToken(token: string, body: { rating: number; comment: string }) {
  return call(`/token/${encodeURIComponent(token)}`, posReviewSubmitResultSchema, { method: "POST", body });
}

/** Reseña desde la ficha del producto (la web ya verificó que la clienta compró el producto). */
export function submitProductReview(body: {
  orderNumber: string;
  productSlug: string;
  productName: string | null;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
}) {
  return call("", posReviewSubmitResultSchema, { method: "POST", body });
}

/** Reseña propia de la clienta para el producto (cualquier estado); `null` si no tiene. */
export async function getOwnReview(productSlug: string, email: string): Promise<PosOwnReview | null> {
  const params = new URLSearchParams({ productSlug: normalizePosSlug(productSlug), email });
  const result = await call(`/mine?${params}`, posOwnReviewSchema);
  if (!result.ok && result.status === 404) return null;
  return unwrap(result);
}

export async function deleteOwnReview(productSlug: string, email: string): Promise<boolean> {
  const result = await call("/mine/delete", posReviewDeletedSchema, {
    method: "POST",
    body: { productSlug: normalizePosSlug(productSlug), customerEmail: email },
  });
  return unwrap(result).deleted;
}
