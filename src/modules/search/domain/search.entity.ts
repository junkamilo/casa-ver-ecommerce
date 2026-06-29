const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".ogg"];

const MIN_TOKEN_LENGTH = 2;
const MIN_PREFIX_LENGTH = 4;

/** Quita tildes, colapsa espacios y pasa a minúsculas para comparar búsquedas. */
export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function tokenizeSearchQuery(query: string): string[] {
  return normalizeSearchText(query)
    .split(/\s+/)
    .filter((token) => token.length >= MIN_TOKEN_LENGTH);
}

export function expandSpanishTokenVariants(token: string): string[] {
  const base = normalizeSearchText(token);
  if (!base) return [];

  const variants = new Set<string>([base]);

  if (base.endsWith("es") && base.length > MIN_PREFIX_LENGTH) {
    variants.add(base.slice(0, -2));
  }
  if (base.endsWith("s") && base.length > MIN_PREFIX_LENGTH) {
    variants.add(base.slice(0, -1));
  }

  if (!base.endsWith("s")) {
    variants.add(`${base}s`);
    variants.add(`${base}es`);
  }

  return [...variants];
}

function wordsShareFlexiblePrefix(a: string, b: string): boolean {
  if (a === b) return true;

  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;

  if (shorter.length < MIN_PREFIX_LENGTH) return false;

  return longer.startsWith(shorter);
}

export function tokenMatchesText(normalizedText: string, token: string): boolean {
  const normalizedToken = normalizeSearchText(token);
  if (!normalizedToken || normalizedToken.length < MIN_TOKEN_LENGTH) return false;

  const text = normalizeSearchText(normalizedText);
  if (text.includes(normalizedToken)) return true;

  const variants = expandSpanishTokenVariants(normalizedToken);
  for (const variant of variants) {
    if (variant.length >= MIN_TOKEN_LENGTH && text.includes(variant)) {
      return true;
    }
  }

  const textWords = text.split(/\s+/).filter(Boolean);
  for (const word of textWords) {
    for (const variant of variants) {
      if (word === variant) return true;
      if (wordsShareFlexiblePrefix(word, variant)) return true;
    }
  }

  return false;
}

export function productMatchesSearch(searchableText: string, query: string): boolean {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return false;

  const normalizedText = normalizeSearchText(searchableText);
  return tokens.every((token) => tokenMatchesText(normalizedText, token));
}

export function matchesSearchQuery(
  haystack: string | null | undefined,
  query: string
): boolean {
  if (!haystack) return false;
  return productMatchesSearch(haystack, query);
}

export interface SearchRelevanceFields {
  name: string;
  slug?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  description?: string | null;
  garmentTypeNames?: string[];
  categoryNames?: string[];
  itemNames?: string[];
}

export function scoreSearchRelevance(fields: SearchRelevanceFields, query: string): number {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return 0;

  const tokensMatchText = (text: string) => {
    const normalized = normalizeSearchText(text);
    return tokens.every((token) => tokenMatchesText(normalized, token));
  };

  const tokensMatchAnyInText = (text: string) => {
    const normalized = normalizeSearchText(text);
    return tokens.some((token) => tokenMatchesText(normalized, token));
  };

  if (tokensMatchText(fields.name)) {
    return 3;
  }

  const primaryText = [
    fields.slug,
    fields.metaTitle,
    fields.metaDescription,
    ...(fields.garmentTypeNames ?? []),
  ]
    .filter(Boolean)
    .join(" ");

  if (tokensMatchAnyInText(primaryText)) {
    return 2;
  }

  const secondaryText = [
    fields.description,
    ...(fields.categoryNames ?? []),
    ...(fields.itemNames ?? []),
  ]
    .filter(Boolean)
    .join(" ");

  if (tokensMatchAnyInText(secondaryText)) {
    return 1;
  }

  return 0;
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

export function calculateMinimumPrice(
  basePrice: number | string,
  itemPrices: (number | string | null)[]
): number {
  const validPrices = itemPrices
    .map((p) => (p ? Number(p) : null))
    .filter((value): value is number => value !== null);

  return validPrices.length > 0 ? Math.min(...validPrices) : Number(basePrice);
}
