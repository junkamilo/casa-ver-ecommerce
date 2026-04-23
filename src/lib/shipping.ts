/**
 * Lógica de tarifas de envío para Casa Verde.
 *
 * Ciudades con tarifa preferencial: $11.000
 * San Andrés / Providencia: $30.000
 * Resto del país: $18.000
 */

export const SHIPPING_SANTANDER = 11_000;
export const SHIPPING_NATIONAL = 18_000;
export const SHIPPING_ISLANDS = 30_000;

function normalizeValue(v: string): string {
  return v
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Ciudades con tarifa especial de $11.000.
 */
export const PREFERRED_11000_CITIES = new Set([
  "San Gil",
  "Barrancabermeja",
  "Bucaramanga",
  "Giron",
  "Piedecuesta",
  "Floridablanca",
  "Lebrija",
  "Sabana de torres",
  "Valledupar",
  "Cucuta",
  "Cantagallo",
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

  const isIslandsDepartment = deptNorm === "san andres y providencia";
  const isIslandsCity =
    cityNorm === "san andres" ||
    cityNorm === "providencia" ||
    cityNorm === "providencia y santa catalina";
  if (isIslandsDepartment || isIslandsCity) return SHIPPING_ISLANDS;

  for (const preferredCity of PREFERRED_11000_CITIES) {
    if (normalizeValue(preferredCity) === cityNorm) return SHIPPING_SANTANDER;
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
