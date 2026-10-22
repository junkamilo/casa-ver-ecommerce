/** Dominios HTTPS que `next/image` puede optimizar (usado en next.config.ts). */
export const REMOTE_IMAGE_HOSTS = [
  "media.casaverdeoficial.com",
  "casa-verde-cdn.b-cdn.net",
  "images.unsplash.com",
  "lh3.googleusercontent.com",
  "lh3.google.com",
] as const;

/**
 * Base pública de los medios del POS (p. ej. `https://pos.casaverdeoficial.com/api`). El POS envía
 * las fotos como `<base>/media/files/...`. En desarrollo puede ser `http://localhost:8080/api`.
 */
export const POS_MEDIA_BASE_URL = (process.env.NEXT_PUBLIC_POS_MEDIA_BASE_URL ?? "").trim().replace(/\/+$/, "");

function posMediaBase(): URL | null {
  if (!POS_MEDIA_BASE_URL) return null;
  try {
    return new URL(POS_MEDIA_BASE_URL);
  } catch {
    return null;
  }
}

/** Patrón de `images.remotePatterns` para los medios del POS; null si no está configurado. */
export function posMediaRemotePattern() {
  const base = posMediaBase();
  if (!base) return null;
  return {
    protocol: base.protocol.replace(":", "") as "http" | "https",
    hostname: base.hostname,
    port: base.port,
    pathname: `${base.pathname.replace(/\/+$/, "")}/media/**`,
  };
}

/** El POS corre en la red local (solo desarrollo): `next/image` lo bloquea salvo que se permita. */
export function isPosMediaLocal(): boolean {
  const host = posMediaBase()?.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "host.docker.internal";
}

/**
 * URL de una foto que vino del POS: absoluta bajo su base de medios, o la ruta relativa
 * `/media/...` que el POS enviaba antes de publicar URLs absolutas (no existe en la web).
 */
export function isPosMediaUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("/media/")) return true;
  return Boolean(POS_MEDIA_BASE_URL) && url.startsWith(`${POS_MEDIA_BASE_URL}/`);
}

export function isAllowedRemoteImage(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("/media/")) return false;
  if (url.startsWith("/")) return true;
  if (POS_MEDIA_BASE_URL && url.startsWith(`${POS_MEDIA_BASE_URL}/media/`)) return true;
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && (REMOTE_IMAGE_HOSTS as readonly string[]).includes(hostname);
  } catch {
    return false;
  }
}
