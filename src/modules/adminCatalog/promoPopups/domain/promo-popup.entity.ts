import { isCouponWithinSchedule } from "@/modules/checkout/domain/coupon.entity";
import type { CouponScheduleFields } from "@/modules/checkout/domain/coupon-schedule";

export function isPromoPopupInSchedule(
  popup: CouponScheduleFields,
  now: Date = new Date()
): boolean {
  return isCouponWithinSchedule(popup, now);
}

export const PLACEMENT_LABELS: Record<"HOME" | "PRODUCT" | "CHECKOUT", string> = {
  HOME: "Inicio (Home)",
  PRODUCT: "Producto",
  CHECKOUT: "Checkout",
};
