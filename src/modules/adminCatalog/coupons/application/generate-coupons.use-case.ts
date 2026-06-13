import { generateCouponsSchema } from "../contracts/coupon.schema";
import { PrismaCouponAdminRepository } from "../infrastructure/prisma-coupon-admin.repository";
import { CouponValidationError } from "./coupon.errors";

const couponRepository = new PrismaCouponAdminRepository();

export async function generateCouponsUseCase(input: unknown, createdById?: string) {
  const parsed = generateCouponsSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new CouponValidationError(firstIssue?.message ?? "Datos inválidos");
  }

  return couponRepository.generateCoupons({
    discountPercentage: parsed.data.discountPercentage,
    quantity: parsed.data.quantity,
    createdById,
  });
}
