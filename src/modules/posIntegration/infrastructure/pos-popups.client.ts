import "server-only";
import { posActivePopupSchema, type ActivePromoPopupDTO, type PromoPopupPlacement } from "../contracts/pos-popups.schema";
import { PosApiError } from "./pos-catalog.client";
import { getPosApiConfig, isPosCatalogConfigured } from "./pos-config";

// Popups publicitarios del POS (md/COMPARACION-TABLAS-POPUPS-POS-vs-WEB.md). Van por la Data Cache de Next
// (60 s, tags `pos-popups` / `pos-popups-<ubicación>`); el aviso `popup` del POS los purga al instante.

const REQUEST_TIMEOUT_MS = 5_000;
const REVALIDATE_SECONDS = 60;

export const POS_POPUPS_CACHE_TAG = "pos-popups";
export const posPopupsCacheTag = (placement: string) => `pos-popups-${placement.trim().toLowerCase()}`;

/** Popup vigente de la ubicación; `null` si no hay ninguno o la integración no está configurada. */
export async function fetchActivePopup(placement: PromoPopupPlacement): Promise<ActivePromoPopupDTO | null> {
  if (!isPosCatalogConfigured()) return null;
  const { baseUrl, apiKey } = getPosApiConfig();
  const url = `${baseUrl.replace(/\/catalog$/, "")}/popups/active?placement=${encodeURIComponent(placement)}`;
  const response = await fetch(url, {
    headers: { "X-Api-Key": apiKey, Accept: "application/json" },
    next: { tags: [POS_POPUPS_CACHE_TAG, posPopupsCacheTag(placement)], revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.status === 204 || response.status === 404) return null;
  if (!response.ok) throw new PosApiError(`POS respondió ${response.status} en /popups/active`, response.status);

  const json = await response.json().catch(() => null);
  if (json?.data == null) return null;
  const parsed = posActivePopupSchema.safeParse(json.data);
  if (!parsed.success) {
    throw new PosApiError(`Respuesta inesperada del POS en /popups/active: ${parsed.error.issues[0]?.message}`, 502);
  }
  return parsed.data;
}
