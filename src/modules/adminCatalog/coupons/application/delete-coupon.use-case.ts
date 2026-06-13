import { deleteCouponSchema } from "../contracts/coupon.schema";
import { PrismaCouponAdminRepository } from "../infrastructure/prisma-coupon-admin.repository";
import {
  CouponConflictError,
  CouponNotFoundError,
  CouponValidationError,
} from "./coupon.errors";

const couponRepository = new PrismaCouponAdminRepository();

export async function deleteCouponUseCase(input: unknown) {
  const parsed = deleteCouponSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new CouponValidationError(firstIssue?.message ?? "ID inválido");
  }

  const coupon = await couponRepository.findById(parsed.data.id);
  if (!coupon) {
    throw new CouponNotFoundError("Cupón no encontrado");
  }

  if (coupon.isUsed) {
    throw new CouponConflictError("No se puede eliminar un cupón ya utilizado");
  }

  return couponRepository.deleteCoupon(parsed.data.id);
}
