import "server-only";
import {
  DEFAULT_CASA_VERDE_THEME,
  posActiveThemeSchema,
  posThemeTokensSchema,
  type PosThemeTokens,
} from "../contracts/pos-themes.schema";
import { getPosApiConfig, isPosCatalogConfigured } from "./pos-config";

// Tema activo desde el POS (md/PLAN-IMPLEMENTACION-MODULO-TEMAS-POS-vs-WEB.md §8).
// Se cachea en el servidor con Next.js Data Cache (tag `pos-theme`, 1 h de respaldo) y se purga
// al instante cuando el POS envía el webhook `theme.activated` / `theme.upserted`.

const REQUEST_TIMEOUT_MS = 4_000;
const REVALIDATE_SECONDS = 3600;

export const POS_THEME_CACHE_TAG = "pos-theme";

export { DEFAULT_CASA_VERDE_THEME };

/**
 * Consulta los tokens del tema activo en el POS (`/api/public/theme/active`).
 * Si el POS no está configurado, no responde, envía una versión desconocida o la campaña ya venció,
 * devuelve de forma autónoma y segura el tema canónico `DEFAULT_CASA_VERDE_THEME`.
 */
export async function fetchActiveThemeTokens(): Promise<PosThemeTokens> {
  if (!isPosCatalogConfigured()) {
    return DEFAULT_CASA_VERDE_THEME;
  }

  const { baseUrl, apiKey } = getPosApiConfig();
  const url = `${baseUrl.replace(/\/catalog$/, "")}/theme/active`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey,
        Accept: "application/json",
        "X-Channel": "WEB",
      },
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: [POS_THEME_CACHE_TAG],
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.warn(`[POS/Theme] HTTP ${response.status} en /theme/active. Usando tema por defecto Casa Verde.`);
      return DEFAULT_CASA_VERDE_THEME;
    }

    const json = await response.json().catch(() => null);
    const rawData = json?.data ?? json;

    const parsedEnvelope = posActiveThemeSchema.safeParse(rawData);
    if (parsedEnvelope.success) {
      const { validUntil, isDefault, tokens } = parsedEnvelope.data;
      if (!isDefault && validUntil) {
        const exp = new Date(validUntil);
        if (!Number.isNaN(exp.getTime()) && exp.getTime() <= Date.now()) {
          return DEFAULT_CASA_VERDE_THEME;
        }
      }
      return tokens;
    }

    const parsedTokens = posThemeTokensSchema.safeParse(rawData?.tokens ?? rawData);
    if (parsedTokens.success) {
      return parsedTokens.data;
    }

    console.warn("[POS/Theme] Contrato de tema no reconocido o inválido. Usando fallback Casa Verde.");
    return DEFAULT_CASA_VERDE_THEME;
  } catch (error) {
    console.warn(
      "[POS/Theme] Error al consultar el tema en el POS. Usando fallback offline Casa Verde:",
      error instanceof Error ? error.message : error,
    );
    return DEFAULT_CASA_VERDE_THEME;
  }
}

/**
 * Consulta un tema específico en el POS (`/api/public/theme/preview/{id}`) sin caché para previsualización
 * en vivo desde Diseño → Temas.
 */
export async function fetchPreviewThemeTokens(themeId: string): Promise<PosThemeTokens | null> {
  if (!isPosCatalogConfigured() || !/^[0-9a-fA-F-]{8,64}$/.test(themeId.trim())) {
    return null;
  }

  const { baseUrl, apiKey } = getPosApiConfig();
  const url = `${baseUrl.replace(/\/catalog$/, "")}/theme/preview/${encodeURIComponent(themeId.trim())}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey,
        Accept: "application/json",
        "X-Channel": "WEB",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) return null;
    const json = await response.json().catch(() => null);
    const rawData = json?.data ?? json;
    const parsed = posThemeTokensSchema.safeParse(rawData?.tokens ?? rawData);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
