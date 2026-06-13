const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".ogg"];

/** Quita tildes y pasa a minúsculas para comparar búsquedas sin depender de acentos. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function matchesSearchQuery(
  haystack: string | null | undefined,
  query: string
): boolean {
  const normalizedQuery = normalizeSearchText(query.trim());
  if (!haystack || !normalizedQuery) return false;
  return normalizeSearchText(haystack).includes(normalizedQuery);
}

export function isVideoUrl(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

export function pickFirstImageUrl(urls: (string | undefined | null)[]): string | null {
  for (const url of urls) {
    if (url && !isVideoUrl(url)) return url;
  }
  return null;
}

export function calculateMinimumPrice(basePrice: number | string, itemPrices: (number | string | null)[]): number {
  const validPrices = itemPrices
    .map((p) => (p ? Number(p) : null))
    .filter((value): value is number => value !== null);

  return validPrices.length > 0 ? Math.min(...validPrices) : Number(basePrice);
}