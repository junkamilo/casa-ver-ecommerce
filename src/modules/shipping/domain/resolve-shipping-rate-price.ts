export interface ShippingRateCache {
  rateByDepartment: Record<string, number>;
  rateByCity: Record<string, number>;
}

/**
 * Resuelve el precio de envío para una ciudad/departamento normalizados.
 * Prioridad: excepción de ciudad > tarifa del departamento > null (sin tarifa configurada).
 */
export function resolveShippingRatePrice(
  normalizedCity: string,
  normalizedDepartment: string,
  cache: ShippingRateCache
): number | null {
  const cityKey = `${normalizedCity}|${normalizedDepartment}`;
  if (cache.rateByCity[cityKey] != null) return cache.rateByCity[cityKey];
  if (cache.rateByDepartment[normalizedDepartment] != null) return cache.rateByDepartment[normalizedDepartment];
  return null;
}
