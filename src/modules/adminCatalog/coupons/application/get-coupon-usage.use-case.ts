import { getCouponUsageSchema } from "../contracts/coupon.schema";
import { PrismaCouponAdminRepository } from "../infrastructure/prisma-coupon-admin.repository";
import { mapCouponUsageToDetail } from "../presentation/mappers";
import {
  CouponNotFoundError,
  CouponValidationError,
} from "./coupon.errors";

const couponRepository = new PrismaCouponAdminRepository();

export async function getCouponUsageUseCase(input: unknown) {
  const parsed = getCouponUsageSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new CouponValidationError(firstIssue?.message ?? "ID inválido");
  }

  const result = await couponRepository.getCouponUsageDetail(parsed.data.id);

  if (!result) {
    throw new CouponNotFoundError("Cupón no encontrado");
  }

  if (!result.coupon.isUsed || !result.coupon.usedByOrderId) {
    throw new CouponValidationError("Este cupón aún no ha sido utilizado");
  }

  if (!result.order) {
    throw new CouponNotFoundError("No se encontró la orden asociada a este cupón");
  }

  return mapCouponUsageToDetail(result.coupon, result.order);
}
