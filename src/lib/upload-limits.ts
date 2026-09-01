/**
 * Límites de negocio para subidas a Bunny (Casa Verde).
 * Bunny no impone techo; estos valores son decisión UX/capacidad.
 *
 * Heroes: entrada generosa, salida estricta (WebP por variant).
 * Catálogo: 15 MB imagen / 500 MB video.
 */

/** Por debajo del límite ~4.5 MB de body en Vercel serverless. */
export const UPLOAD_CHUNK_BYTES = 3 * 1024 * 1024; // 3 MB

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB

export type HeroImageVariant = "desktop" | "tablet" | "mobile";

/** Entrada generosa → salida estricta por variant (WebP). */
export const HERO_IMAGE = {
  maxInputBytes: 30 * 1024 * 1024,
  maxInputPixels: 60_000_000,
  outputMime: "image/webp",
  variants: {
    desktop: { maxWidth: 2560, targetBytes: 1_100_000 },
    tablet: { maxWidth: 1536, targetBytes: 700_000 },
    mobile: { maxWidth: 1080, targetBytes: 500_000 },
  },
} as const;

export const HERO_VIDEO = {
  maxInputBytes: 100 * 1024 * 1024,
  maxDurationSec: 30,
} as const;

/** Margen ~5% sobre targetBytes en validación de salida. */
export const HERO_OUTPUT_BYTES_MARGIN = 1.05;

/** @deprecated Use HERO_IMAGE.maxInputBytes — kept for grep compat */
export const MAX_HERO_IMAGE_BYTES = HERO_IMAGE.maxInputBytes;
/** @deprecated Use HERO_VIDEO.maxInputBytes */
export const MAX_HERO_VIDEO_BYTES = HERO_VIDEO.maxInputBytes;
export const MAX_HERO_VIDEO_DURATION_SEC = HERO_VIDEO.maxDurationSec;

/** Si el archivo supera esto, no pasar por el proxy monolítico (evita 413). */
export const PROXY_SAFE_MAX_BYTES = 3_500_000;

/** Margen sobre ceil(MAX_VIDEO / CHUNK) ≈ 167 → tope seguro de partes. */
export const MAX_UPLOAD_CHUNKS = 200;

export const HERO_IMAGE_MIME_ALLOWLIST = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Heroes video: solo MP4 H.264 en contenedor mp4. */
export const HERO_VIDEO_MIME_ALLOWLIST = new Set(["video/mp4"]);

export const HERO_IMAGE_VARIANTS = ["desktop", "tablet", "mobile"] as const;

export function isHeroImageVariant(v: string): v is HeroImageVariant {
  return (HERO_IMAGE_VARIANTS as readonly string[]).includes(v);
}

export function getHeroVariantTargetBytes(variant: HeroImageVariant): number {
  return HERO_IMAGE.variants[variant].targetBytes;
}

export function getHeroVariantMaxOutputBytes(variant: HeroImageVariant): number {
  return Math.ceil(getHeroVariantTargetBytes(variant) * HERO_OUTPUT_BYTES_MARGIN);
}

export function bytesToMbLabel(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

export function formatBytesLabel(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

export function getUploadLimitsForFolder(folder?: string): {
  maxImageBytes: number;
  maxVideoBytes: number;
} {
  if (folder === "heroes") {
    return {
      maxImageBytes: HERO_IMAGE.maxInputBytes,
      maxVideoBytes: HERO_VIDEO.maxInputBytes,
    };
  }
  return {
    maxImageBytes: MAX_IMAGE_BYTES,
    maxVideoBytes: MAX_VIDEO_BYTES,
  };
}
