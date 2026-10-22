import { promotionalCouponIdSchema } from "../contracts/coupon.schema";
import { PrismaCouponAdminRepository } from "../infrastructure/prisma-coupon-admin.repository";
import { CouponConflictError, CouponNotFoundError, CouponValidationError, POS_MANAGED_MESSAGE } from "./coupon.errors";

const couponRepository = new PrismaCouponAdminRepository();

export async function deactivatePromotionalCouponUseCase(input: unknown) {
  const parsed = promotionalCouponIdSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new CouponValidationError(firstIssue?.message ?? "ID inválido");
  }

  const coupon = await couponRepository.findPromotionalById(parsed.data.id);
  if (!coupon) {
    throw new CouponNotFoundError("Cupón promocional no encontrado");
  }
  if (coupon.source === "POS") {
    throw new CouponConflictError(POS_MANAGED_MESSAGE);
  }

  return couponRepository.deactivatePromotionalCoupon(parsed.data.id);
}
