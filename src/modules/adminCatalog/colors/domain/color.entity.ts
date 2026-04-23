export function normalizeColorName(raw: string): string {
  return raw.trim();
}

export function normalizeHexCode(raw: string): string {
  return raw.trim().toUpperCase();
}
