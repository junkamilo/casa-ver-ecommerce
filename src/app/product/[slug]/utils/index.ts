export const isVideoUrl = (url: string): boolean =>
  /\.(mp4|mov|avi|webm|mkv|ogg)$/i.test(url);

export const normalizeVideoUrl = (url: string): string =>
  url.replace(/\.(mov|avi|webm|mkv)(\?.*)?$/, ".mp4$2");
