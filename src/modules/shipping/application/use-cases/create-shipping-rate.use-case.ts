import { Prisma } from "@prisma/client";
import { createShippingRateDb } from "../../infrastructure/prisma-shipping-rate.repository";
import { ShippingRateNameConflictError } from "../errors";

export async function createShippingRateUseCase(data: { name?: string | null; price: number }) {
  try {
    return await createShippingRateDb(data);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ShippingRateNameConflictError(data.name || "Sin nombre");
    }
    throw error;
  }
}
