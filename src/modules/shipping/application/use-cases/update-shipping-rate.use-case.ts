import { Prisma } from "@prisma/client";
import { updateShippingRateDb } from "../../infrastructure/prisma-shipping-rate.repository";
import { invalidateShippingCache } from "../../infrastructure/redis-shipping-cache";
import { ShippingRateNameConflictError } from "../errors";

export async function updateShippingRateUseCase(
  id: string,
  data: { name?: string | null; price?: number }
) {
  try {
    const result = await updateShippingRateDb(id, data);
    await invalidateShippingCache();
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ShippingRateNameConflictError(data.name ?? "");
    }
    throw error;
  }
}
