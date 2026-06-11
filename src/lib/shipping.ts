/**
 * Lógica de tarifas de envío para Casa Verde.
 *
 * Municipios con tarifa preferencial: $11.000
 * San Andrés / Providencia: $30.000
 * Resto del país: $18.000
 */

export const SHIPPING_SANTANDER = 11_000;
export const SHIPPING_NATIONAL = 18_000;
export const SHIPPING_ISLANDS = 30_000;

/**
 * Ciudades/municipios con tarifa especial de $11.000.
 */
export const CHEAP_SHIPPING_CITIES = new Set([
  "Bucaramanga",
  "Giron",
  "Piedecuesta",
  "Floridablanca",
  "Barrancabermeja",
  "San Gil",
  "Sabana de Torres",
  "Lebrija",
  "Valledupar",
  "Cúcuta",
  "Cantagallo",
]);

/**
 * Ciudades/municipios con tarifa especial de $30.000.
 */
export const ISLAND_SHIPPING_CITIES = new Set([
  "San Andrés",
  "Providencia",
  "Providencia y Santa Catalina",
]);

/**
 * Calcula el costo de envío según ciudad y departamento.
 * Comparación case-insensitive para robustez.
 */
export function getShippingCost(city: string, department: string): number {
  const cityNorm = normalizeValue(city);
  const deptNorm = normalizeValue(department);

  // ⚠️ TEMPORAL — tarifa de prueba $1.000. Eliminar cuando ya no se necesite.
  if (deptNorm === "prueba") return 1_000;

  for (const islandCity of ISLAND_SHIPPING_CITIES) {
    if (islandCity.toLowerCase() === cityNorm) return SHIPPING_ISLANDS;
  }

  for (const cheapCity of CHEAP_SHIPPING_CITIES) {
    if (cheapCity.toLowerCase() === cityNorm) return SHIPPING_SANTANDER;
  }

  return SHIPPING_NATIONAL;
}

/**
 * Devuelve true si la ciudad/departamento tienen tarifa Santander ($11.000).
 */
export function isSantanderCity(city: string, department: string): boolean {
  return getShippingCost(city, department) === SHIPPING_SANTANDER;
}

/**
 * Formatea el costo de envío en COP para mostrar al usuario.
 */
export function formatShippingCost(cost: number): string {
  return `$${cost.toLocaleString("es-CO")}`;
}
