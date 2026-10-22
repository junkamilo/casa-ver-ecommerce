import { z } from "zod";

// Espejo de `ShippingPublicationService.PublicShippingSnapshot` del POS (GET /api/public/shipping).

const nullableString = z.string().nullish().transform((v) => v ?? null);

export const posShippingRateSchema = z.object({
  rateId: z.string().min(1),
  name: nullableString,
  price: z.number().int().nonnegative(),
  active: z.boolean(),
});

export const posMunicipalitySchema = z.object({
  daneCode: z.string().regex(/^\d{5}$/),
  name: z.string().min(1),
  active: z.boolean(),
  // null = usa la tarifa por defecto (config.defaultRateId).
  rateId: nullableString,
});

export const posDepartmentSchema = z.object({
  daneCode: z.string().regex(/^\d{2}$/),
  name: z.string().min(1),
  active: z.boolean(),
  municipalities: z.array(posMunicipalitySchema).default([]),
});

export const posCountrySchema = z.object({
  isoCode2: z.string().length(2),
  isoCode3: z.string().length(3),
  numericCode: nullableString,
  name: z.string().min(1),
  phoneCode: nullableString,
  currency: nullableString,
  active: z.boolean(),
  departments: z.array(posDepartmentSchema).default([]),
});

export const posShippingSnapshotSchema = z.object({
  config: z.object({
    freeShippingThreshold: z.number().int().nonnegative(),
    defaultRateId: nullableString,
  }),
  rates: z.array(posShippingRateSchema),
  countries: z.array(posCountrySchema),
  updatedAt: nullableString,
});

export type PosShippingRate = z.infer<typeof posShippingRateSchema>;
export type PosShippingCountry = z.infer<typeof posCountrySchema>;
export type PosShippingSnapshot = z.infer<typeof posShippingSnapshotSchema>;
