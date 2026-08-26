export interface RateResolution {
  municipalityRate: number | null; // municipality.shippingRate?.price ?? null
  departmentRate: number | null;   // municipality.department.shippingRate?.price ?? null
  defaultRate: number;             // config.defaultRate.price (obligatorio)
}

/** Prioridad: municipio → departamento → nacional. */
export function resolveShippingPrice(r: RateResolution): number {
  return r.municipalityRate ?? r.departmentRate ?? r.defaultRate;
}

/** Aplica envío gratis sobre el precio ya resuelto. */
export function applyFreeShipping(
  resolvedPrice: number,
  subtotalNeto: number,
  freeShippingThreshold: number
): number {
  return subtotalNeto >= freeShippingThreshold ? 0 : resolvedPrice;
}
