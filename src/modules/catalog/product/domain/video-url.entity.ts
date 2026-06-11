// Predicados puros para URLs de video usadas en la galería del PDP.
// El video puede venir tanto en `product.videoUrl` (campo dedicado) como
// embebido dentro del array `images` (URL con extensión de video).

const VIDEO_EXTENSIONS_REGEX = /\.(mp4|mov|avi|webm|mkv|ogg)$/i;

const NON_MP4_EXTENSIONS_REGEX = /\.(mov|avi|webm|mkv)(\?.*)?$/;

export const isVideoUrl = (url: string): boolean =>
  VIDEO_EXTENSIONS_REGEX.test(url);

/**
 * Convierte extensiones de video alternativas a `.mp4` para máxima compatibilidad
 * con `<video>` en navegadores. Preserva query string si existe.
 */
export const normalizeVideoUrl = (url: string): string =>
  url.replace(NON_MP4_EXTENSIONS_REGEX, ".mp4$2");
