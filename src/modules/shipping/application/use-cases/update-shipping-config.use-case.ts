import { upsertShippingConfigDb } from "../../infrastructure/prisma-shipping-config.repository";
import { getShippingRateByIdDb } from "../../infrastructure/prisma-shipping-rate.repository";
import { invalidateShippingCache } from "../../infrastructure/redis-shipping-cache";
import type { UpdateShippingConfigDTO } from "../../contracts/shipping.dto";
import {
  ShippingDefaultRateInactiveValidationError,
  ShippingRateNotFoundError,
} from "../errors";

export async function updateShippingConfigUseCase(data: UpdateShippingConfigDTO) {
  if (data.defaultRateId) {
    const rate = await getShippingRateByIdDb(data.defaultRateId);
    if (!rate) throw new ShippingRateNotFoundError();
    if (!rate.isActive) throw new ShippingDefaultRateInactiveValidationError();
  }

  const result = await upsertShippingConfigDb({
    freeShippingThreshold: data.freeShippingThreshold,
    ...(data.defaultRateId !== undefined ? { defaultRateId: data.defaultRateId } : {}),
  });
  await invalidateShippingCache();
  return result;
}
