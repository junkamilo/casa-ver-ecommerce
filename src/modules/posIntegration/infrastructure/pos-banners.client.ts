import "server-only";
import { posHeroSchema, type PosHero } from "../contracts/pos-banners.schema";
import { PosApiError } from "./pos-catalog.client";
import { getPosApiConfig, isPosCatalogConfigured } from "./pos-config";

// Carrusel del inicio desde el POS (md/COMPARACION-TABLAS-BANNERS-POS-vs-WEB.md). Va por la Data Cache de Next
// (tag `hero`, 1 h de respaldo); el aviso `banner` del POS la purga al instante.

const REQUEST_TIMEOUT_MS = 5_000;
const REVALIDATE_SECONDS = 3600;

export const POS_HERO_CACHE_TAG = "hero";

/** Banners activos y duración; `null` si la integración no está configurada. Lanza si el POS no responde. */
export async function fetchHeroForRender(): Promise<PosHero | null> {
  if (!isPosCatalogConfigured()) return null;
  const { baseUrl, apiKey } = getPosApiConfig();
  const response = await fetch(`${baseUrl.replace(/\/catalog$/, "")}/banners`, {
    headers: { "X-Api-Key": apiKey, Accept: "application/json" },
    next: { tags: [POS_HERO_CACHE_TAG], revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new PosApiError(`POS respondió ${response.status} en /banners`, response.status);

  const json = await response.json().catch(() => null);
  const parsed = posHeroSchema.safeParse(json?.data);
  if (!parsed.success) {
    throw new PosApiError(`Respuesta inesperada del POS en /banners: ${parsed.error.issues[0]?.message}`, 502);
  }
  return parsed.data;
}
