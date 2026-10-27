/**
 * Envíos de Casa Verde: las tarifas, la cobertura y el envío gratis los define el POS (Tienda → Precio de
 * envíos) y la web los consulta en su API (modules/shipping/application/pos-shipping.ts).
 */

/** Solo para la barra de anuncios mientras llegan las condiciones del POS. */
export const FREE_SHIPPING_MIN_NET_SUBTOTAL = 300_000;

export interface ShippingQuote {
  cost: number;
  baseCost: number | null;
  isFreeByThreshold: boolean;
  isPendingAddress: boolean;
  /** Monto de envío gratis del POS (0 si el POS lo tiene pausado). */
  freeShippingThreshold?: number;
  /** La dirección no tiene cobertura según el POS. */
  noCoverage?: boolean;
  rateName?: string | null;
}
