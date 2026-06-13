import type { CouponListQueryDTO } from "../contracts/coupon.dto";
import { promotionalCouponListQuerySchema } from "../contracts/coupon.schema";
import { PrismaCouponAdminRepository } from "../infrastructure/prisma-coupon-admin.repository";
import { CouponValidationError } from "./coupon.errors";

const couponRepository = new PrismaCouponAdminRepository();

export async function listPromotionalCouponsUseCase(input: unknown) {
  const parsed = promotionalCouponListQuerySchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new CouponValidationError(firstIssue?.message ?? "Parámetros inválidos");
  }

  const query: CouponListQueryDTO = {
    page: parsed.data.page,
    limit: parsed.data.limit,
    search: parsed.data.search || undefined,
  };

  return couponRepository.listPromotionalCoupons(query);
}
