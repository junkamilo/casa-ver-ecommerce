import { z } from "zod";

// Envíos del POS que consulta la web: precio de envío (GET /api/public/shipping/quote) y geografía
// (GET /api/public/geography/**). La web no guarda tarifas ni geografía.

const nullableString = z.string().nullish().transform((v) => v ?? null);

/**
 * Precio de envío (GET /api/public/shipping/quote). `ok = false`: sin cobertura, sin tarifa nacional o sin
 * tarifa activa (`reason`: SIN_COBERTURA, MISSING_DEFAULT_RATE, SIN_TARIFA_NACIONAL). `cost`: lo que se cobra
 * (0 con envío gratis); `baseCost`: la tarifa. `freeShippingActive = false`: envío gratis pausado (V103).
 */
export const posShippingQuoteSchema = z.object({
  ok: z.boolean(),
  reason: nullableString,
  cost: z.number().int().nullish().transform((v) => v ?? null),
  baseCost: z.number().int().nullish().transform((v) => v ?? null),
  rateName: nullableString,
  zoneRate: z.boolean().default(false),
  freeShippingThreshold: z.number().int().nonnegative().default(0),
  freeByThreshold: z.boolean().default(false),
  // POS anteriores a este campo no lo envían: el envío gratis estaba siempre activo.
  freeShippingActive: z.boolean().default(true),
});

/** País, departamento o municipio de GET /api/public/geography/** (`code`: ISO o DANE). */
export const posGeoItemSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
});

export type PosShippingQuote = z.infer<typeof posShippingQuoteSchema>;
export type PosGeoItem = z.infer<typeof posGeoItemSchema>;
