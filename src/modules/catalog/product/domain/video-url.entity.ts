// Predicados puros para URLs de video usadas en la galería del PDP y en cards.
// El video puede venir en `product.videoUrl`, en imágenes generales o en el
// array `images` de cada color (subido como portada desde el admin).

const VIDEO_EXTENSIONS_REGEX = /\.(mp4|mov|avi|webm|mkv|ogg|m4v)$/i;

export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS_REGEX.test(clean) || clean.includes("/video/");
};

/** Bunny CDN stores files with their original extension; use the URL as-is. */
export const normalizeVideoUrl = (url: string): string => url;

/** Primera URL de portada del color (puede ser imagen o video). */
export const getColorCoverUrl = (urls: string[]): string | null =>
  urls.find((url) => url.trim().length > 0) ?? null;
