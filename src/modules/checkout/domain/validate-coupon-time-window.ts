import { getCouponScheduleStatus } from "./coupon.entity";
import {
  CouponExpiredError,
  CouponNotYetValidError,
} from "../application/checkout.errors";

export type CouponTimeWindowInput = {
  scheduleMode?: "NONE" | "SINGLE_DAY" | "DATE_RANGE" | string | null;
  validFrom?: Date | string | null;
  validTo?: Date | string | null;
  expiresAt?: Date | string | null;
};

/**
 * Orquestador canónico de vigencia temporal.
 * `now` debe ser siempre hora de servidor (`new Date()`); nunca timestamps del cliente.
 */
export function validateCouponTimeWindow(
  coupon: CouponTimeWindowInput,
  now: Date = new Date()
): void {
  const status = getCouponScheduleStatus(coupon, now);
  if (status === "NOT_STARTED") {
    throw new CouponNotYetValidError();
  }
  if (status === "EXPIRED") {
    throw new CouponExpiredError();
  }
}
