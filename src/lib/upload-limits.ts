/**
 * Límites de negocio para subidas a Bunny (Casa Verde).
 * Bunny no impone techo; estos valores son decisión UX/capacidad.
 *
 * - Imágenes 15 MB: holgado para HEIC de celular antes de comprimir en browser.
 * - Videos 500 MB: clips de producto / hero en buena calidad; chunked lo soporta.
 */

/** Por debajo del límite ~4.5 MB de body en Vercel serverless. */
export const UPLOAD_CHUNK_BYTES = 3 * 1024 * 1024; // 3 MB

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB

/** Si el archivo supera esto, no pasar por el proxy monolítico (evita 413). */
export const PROXY_SAFE_MAX_BYTES = 3_500_000;

/** Margen sobre ceil(MAX_VIDEO / CHUNK) ≈ 167 → tope seguro de partes. */
export const MAX_UPLOAD_CHUNKS = 200;

export function bytesToMbLabel(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}
