import { getRateContextForMunicipality } from "../../infrastructure/prisma-rate.repository";
import { getShippingConfigFromDb } from "../../infrastructure/prisma-shipping-config.repository";
import { resolveShippingPrice, applyFreeShipping } from "../../domain/resolve-shipping-price";

export async function getShippingCost(input: {
  municipalityId: string;
  subtotalNeto: number;
}) {
  const config = await getShippingConfigFromDb();
  if (!config || !config.defaultRate) {
    return { ok: false as const, reason: 'MISSING_DEFAULT_RATE' };
  }

  const ctx = await getRateContextForMunicipality(input.municipalityId);

  if (!ctx || !ctx.isActive) {
    return { ok: false as const, reason: 'SIN_COBERTURA' };
  }

  const municipalityRate = ctx.shippingRate?.isActive ? ctx.shippingRate.price : null;
  const departmentRate = null;

  const resolved = resolveShippingPrice({
    municipalityRate,
    departmentRate,
    defaultRate: config.defaultRate.price,
  });

  const finalCost = applyFreeShipping(resolved, input.subtotalNeto, config.freeShippingThreshold);
  const isFreeByThreshold = input.subtotalNeto >= config.freeShippingThreshold;

  let rateName = config.defaultRate.name;
  if (municipalityRate !== null) {
    rateName = ctx.shippingRate!.name;
  }

  return {
    ok: true as const,
    cost: finalCost,
    baseCost: resolved,
    rateName,
    freeShippingThreshold: config.freeShippingThreshold,
    isFreeByThreshold,
  };
}
