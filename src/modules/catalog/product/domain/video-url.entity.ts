// Predicados puros para URLs de video usadas en la galería del PDP y en cards.
// El video puede venir en `product.videoUrl`, en imágenes generales o en el
// array `images` de cada color (subido como portada desde el admin).

const VIDEO_EXTENSIONS_REGEX = /\.(mp4|mov|avi|webm|mkv|ogg|m4v)$/i;

const NON_MP4_EXTENSIONS_REGEX = /\.(mov|avi|webm|mkv)(\?.*)?$/;

export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS_REGEX.test(clean) || clean.includes("/video/");
};

/**
 * Convierte extensiones de video alternativas a `.mp4` para máxima compatibilidad
 * con `<video>` en navegadores. Preserva query string si existe.
 */
export const normalizeVideoUrl = (url: string): string =>
  url.replace(NON_MP4_EXTENSIONS_REGEX, ".mp4$2");

/** Primera URL de portada del color (puede ser imagen o video). */
export const getColorCoverUrl = (urls: string[]): string | null =>
  urls.find((url) => url.trim().length > 0) ?? null;
