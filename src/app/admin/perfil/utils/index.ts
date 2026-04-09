/**
 * Formatea una fecha ISO al formato largo colombiano.
 * Ej: "1 de enero de 2024"
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
