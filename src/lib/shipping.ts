/**
 * Lógica de tarifas de envío para Casa Verde.
 *
 * Municipios con tarifa preferencial: $11.000
 * San Andrés / Providencia: $30.000
 * Resto del país: $18.000
 */

import { isTestShippingEnabled } from "./constants/colombia";

export const SHIPPING_SANTANDER = 11_000;
export const SHIPPING_NATIONAL = 18_000;
export const SHIPPING_ISLANDS = 30_000;

/** Subtotal neto (productos − cupón) mínimo para envío gratis. */
export const FREE_SHIPPING_MIN_NET_SUBTOTAL = 300_000;

export interface ShippingQuote {
  cost: number;
  baseCost: number | null;
  isFreeByThreshold: boolean;
  isPendingAddress: boolean;
}

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

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Calcula el costo de envío según ciudad y departamento.
 * Comparación case-insensitive para robustez.
 */
export function getShippingCost(city: string, department: string): number {
  const cityNorm = normalizeValue(city);
  const deptNorm = normalizeValue(department);

  // ⚠️ TEMPORAL — tarifa de prueba $1.000. Solo en desarrollo local.
  if (isTestShippingEnabled() && deptNorm === "prueba") return 1_000;

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

function hasShippingAddress(city?: string, department?: string): boolean {
  return Boolean(city?.trim() && department?.trim());
}

/**
 * Resuelve el costo de envío según subtotal neto (después de cupón) y ubicación.
 * Fuente de verdad compartida entre checkout (cliente) y creación de orden (servidor).
 */
export function resolveShippingQuote(input: {
  netSubtotal: number;
  city?: string;
  department?: string;
}): ShippingQuote {
  const hasAddress = hasShippingAddress(input.city, input.department);
  const baseCost = hasAddress
    ? getShippingCost(input.city!.trim(), input.department!.trim())
    : null;

  if (input.netSubtotal >= FREE_SHIPPING_MIN_NET_SUBTOTAL) {
    return {
      cost: 0,
      baseCost,
      isFreeByThreshold: true,
      isPendingAddress: false,
    };
  }

  return {
    cost: baseCost ?? 0,
    baseCost,
    isFreeByThreshold: false,
    isPendingAddress: !hasAddress,
  };
}
