import { promotionalCouponIdSchema } from "../contracts/coupon.schema";
import { PrismaCouponAdminRepository } from "../infrastructure/prisma-coupon-admin.repository";
import { CouponConflictError, CouponNotFoundError, CouponValidationError } from "./coupon.errors";

const couponRepository = new PrismaCouponAdminRepository();

export async function deletePromotionalCouponUseCase(input: unknown) {
  const parsed = promotionalCouponIdSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new CouponValidationError(firstIssue?.message ?? "ID inválido");
  }

  const coupon = await couponRepository.findPromotionalById(parsed.data.id);
  if (!coupon) {
    throw new CouponNotFoundError("Cupón promocional no encontrado");
  }

  if (coupon.currentGlobalUses > 0) {
    throw new CouponConflictError("No se puede eliminar un cupón que ya tiene usos");
  }

  return couponRepository.deletePromotionalCoupon(parsed.data.id);
}
