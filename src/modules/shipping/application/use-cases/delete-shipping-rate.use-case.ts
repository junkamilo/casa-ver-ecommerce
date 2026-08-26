import {
  deleteShippingRateDb,
  getShippingRateByIdDb,
  getShippingRateUsageDb,
} from "../../infrastructure/prisma-shipping-rate.repository";
import { ShippingRateInUseConflictError, ShippingRateNotFoundError } from "../errors";

export async function deleteShippingRateUseCase(id: string) {
  const rate = await getShippingRateByIdDb(id);
  if (!rate) throw new ShippingRateNotFoundError();

  const { departmentsCount, municipalitiesCount } = await getShippingRateUsageDb(id);
  if (departmentsCount > 0 || municipalitiesCount > 0) {
    throw new ShippingRateInUseConflictError(rate.name || "Sin nombre", departmentsCount, municipalitiesCount);
  }
  return deleteShippingRateDb(id);
}
