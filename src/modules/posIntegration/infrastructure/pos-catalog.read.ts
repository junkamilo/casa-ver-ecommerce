import "server-only";
import { posEnvelopeSchema, posPageSchema, posProductSchema, type PosProduct } from "../contracts/pos-catalog.schema";
import { normalizePosSlug } from "../domain/pos-mapper";
import { PosApiError } from "./pos-catalog.client";
import { getPosApiConfig } from "./pos-config";

// Lecturas del catálogo para RENDER (PDP, listados): van por la Data Cache de Next y se purgan por tag
// desde el webhook del POS. Pedidos y stock en vivo siguen en `pos-catalog.client.ts` con no-store.

const REQUEST_TIMEOUT_MS = 8_000;
const REVALIDATE_SECONDS = 3600;
const PAGE_SIZE = 100;
const MAX_PAGES = 50;

export const POS_PRODUCTS_CACHE_TAG = "pos-products";
export const posProductCacheTag = (slug: string) => `pos-product-${normalizePosSlug(slug)}`;

/** Producto del POS para pintar la tienda; `null` si no existe o no es visible (404). */
export async function fetchProductForRender(slug: string): Promise<PosProduct | null> {
  const { baseUrl, apiKey } = getPosApiConfig();
  const path = `/products/${encodeURIComponent(normalizePosSlug(slug))}`;
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "X-Api-Key": apiKey, Accept: "application/json" },
    next: { tags: [POS_PRODUCTS_CACHE_TAG, posProductCacheTag(slug)], revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (response.status === 404) return null;
  if (response.status === 401) throw new PosApiError("Clave de integración del POS inválida", 401);
  if (!response.ok) throw new PosApiError(`POS respondió ${response.status} en ${path}`, response.status);

  const envelope = posEnvelopeSchema.safeParse(await response.json());
  const parsed = envelope.success ? posProductSchema.safeParse(envelope.data.data) : envelope;
  if (!parsed.success) {
    throw new PosApiError(
      `Respuesta inesperada del POS en ${path}: ${parsed.error.issues[0]?.message ?? "formato inválido"}`,
      502,
    );
  }
  return parsed.data;
}

const productPageSchema = posPageSchema(posProductSchema);

/**
 * Catálogo visible completo del POS para los listados (tienda, colecciones, home, búsqueda). Cada página
 * va por la Data Cache con el tag `pos-products`: el webhook la purga cuando cambia cualquier producto.
 */
export async function fetchCatalogForRender(): Promise<PosProduct[]> {
  const { baseUrl, apiKey } = getPosApiConfig();
  const all: PosProduct[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const path = `/products?page=${page}&size=${PAGE_SIZE}`;
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { "X-Api-Key": apiKey, Accept: "application/json" },
      next: { tags: [POS_PRODUCTS_CACHE_TAG], revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (response.status === 401) throw new PosApiError("Clave de integración del POS inválida", 401);
    if (!response.ok) throw new PosApiError(`POS respondió ${response.status} en ${path}`, response.status);

    const envelope = posEnvelopeSchema.safeParse(await response.json());
    const parsed = envelope.success ? productPageSchema.safeParse(envelope.data.data) : envelope;
    if (!parsed.success) {
      throw new PosApiError(
        `Respuesta inesperada del POS en ${path}: ${parsed.error.issues[0]?.message ?? "formato inválido"}`,
        502,
      );
    }
    all.push(...parsed.data.items);
    if (parsed.data.items.length === 0 || all.length >= parsed.data.total) break;
  }
  return all;
}
