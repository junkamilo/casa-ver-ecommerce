/**
 * Normaliza un string para búsquedas geográficas:
 * - Descompone tildes (NFD) y las elimina
 * - Pasa a minúsculas
 * - Trim + colapsa espacios internos
 *
 * Ejemplo: "  Bogotá D.C. " → "bogota d.c."
 */
export function normalizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
