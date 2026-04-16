/**
 * Lógica de tarifas de envío para Casa Verde.
 *
 * Municipios con tarifa preferencial Santander: $11.000
 * Resto del país: $18.000
 */

export const SHIPPING_SANTANDER = 11_000;
export const SHIPPING_NATIONAL = 18_000;

/**
 * Municipios de Santander con tarifa especial de $11.000.
 * Los nombres deben coincidir exactamente con los de MUNICIPIOS["Santander"] en colombia.ts.
 */
export const SANTANDER_CHEAP_CITIES = new Set([
  "Bucaramanga",
  "Girón",
  "Piedecuesta",
  "Floridablanca",
  "Barrancabermeja",
  "San Gil",
  "Barichara",
  "Zapatoca",
  "Socorro",
  "Sabana de Torres",
  "Lebrija",
]);

/**
 * Calcula el costo de envío según ciudad y departamento.
 * Comparación case-insensitive para robustez.
 */
export function getShippingCost(city: string, department: string): number {
  const cityNorm = city.trim().toLowerCase();
  const deptNorm = department.trim().toLowerCase();

  // ⚠️ TEMPORAL — tarifa de prueba $1.000. Eliminar cuando ya no se necesite.
  if (deptNorm === "prueba") return 1_000;

  if (deptNorm !== "santander") return SHIPPING_NATIONAL;

  for (const cheapCity of SANTANDER_CHEAP_CITIES) {
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
