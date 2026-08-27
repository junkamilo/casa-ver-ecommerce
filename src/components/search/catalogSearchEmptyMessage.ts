const MIN_QUERY_LENGTH = 2;

export function catalogSearchEmptyMessage(
  q: string | undefined,
  fallback = "Pronto añadiremos nuevas prendas exclusivas a esta colección.",
): string {
  const trimmed = q?.trim() ?? "";
  if (trimmed.length >= MIN_QUERY_LENGTH) {
    return `No hay productos para “${trimmed}”`;
  }
  return fallback;
}
