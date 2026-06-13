/**
 * Convierte la descripción del admin en viñetas para el PDP.
 * Cada salto de línea = un ítem. También soporta texto legacy con " - " en la misma línea.
 */
export function parseDescriptionBullets(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  let parts: string[];

  if (normalized.includes("\n")) {
    parts = normalized.split("\n");
  } else if (normalized.startsWith("-") || /\s-\s/.test(normalized)) {
    parts = normalized.split(/\s+-\s+/);
  } else {
    return [normalized];
  }

  return parts
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}
