/**
 * Hosts de media permitidos para validar URLs de imágenes/videos en admin.
 */

import path from "path";

const ALLOWED_MEDIA_HOSTS = new Set([
  "media.casaverdeoficial.com",
  "casa-verde-cdn.b-cdn.net",
]);

export const HERO_MEDIA_PREFIX = "casa-verde/heroes/";

export function isAllowedMediaHost(hostname: string): boolean {
  return ALLOWED_MEDIA_HOSTS.has(hostname.toLowerCase());
}

export function isValidMediaUrl(v: unknown): boolean {
  if (typeof v !== "string" || !v.trim()) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && isAllowedMediaHost(u.hostname);
  } catch {
    return false;
  }
}

export function isBunnyCdnUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname === "media.casaverdeoficial.com" ||
      u.hostname === "casa-verde-cdn.b-cdn.net"
    );
  } catch {
    return false;
  }
}

/**
 * Extrae y normaliza la object key de una URL Bunny.
 * Rechaza path traversal (`..`).
 */
export function getBunnyObjectKeyFromUrl(url: string): string | null {
  if (!isBunnyCdnUrl(url)) return null;
  try {
    const parsed = new URL(url);
    const raw = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    if (!raw) return null;
    if (raw.includes("\0") || /%2e%2e/i.test(url)) return null;
    const normalized = path.posix.normalize(raw);
    if (
      normalized === ".." ||
      normalized.startsWith("../") ||
      normalized.includes("/../") ||
      normalized.includes("\\")
    ) {
      return null;
    }
    return normalized;
  } catch {
    return null;
  }
}

/** True si la URL apunta a un objeto bajo casa-verde/heroes/. */
export function isHeroMediaUrl(url: string): boolean {
  if (!isValidMediaUrl(url)) return false;
  const key = getBunnyObjectKeyFromUrl(url);
  return Boolean(key?.startsWith(HERO_MEDIA_PREFIX));
}
