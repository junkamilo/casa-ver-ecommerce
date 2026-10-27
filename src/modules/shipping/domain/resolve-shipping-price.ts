// Envío gratis con las condiciones que publica el POS (shipping.config: monto y si está activo, V103). Misma
// regla que ShippingRules.qualifiesForFree del POS; la tarifa la calcula siempre el POS.

/** Condiciones de envío gratis del POS. `freeShippingActive = false`: el envío se cobra siempre. */
export interface ShippingTerms {
  freeShippingThreshold: number;
  freeShippingActive: boolean;
}

export function qualifiesForFreeShipping(terms: ShippingTerms, subtotalNeto: number): boolean {
  return terms.freeShippingActive && subtotalNeto >= terms.freeShippingThreshold;
}

/** Aplica el envío gratis sobre la tarifa que cotizó el POS. */
export function applyFreeShipping(baseCost: number, subtotalNeto: number, terms: ShippingTerms): number {
  return qualifiesForFreeShipping(terms, subtotalNeto) ? 0 : baseCost;
}
