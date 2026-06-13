// Predicados puros del dominio Cupón en el contexto del checkout.



import type { CouponScheduleMode } from "./coupon-schedule";

import { formatCouponScheduleLabel } from "./coupon-schedule";



export type { CouponScheduleMode };

export { formatCouponScheduleLabel };



export type CouponKind = "BATCH_SINGLE" | "EMAIL_SINGLE" | "PROMOTIONAL";

export type CouponDiscountType = "PERCENTAGE" | "FIXED";



/** Cupones promocionales: máximo 1 uso por persona (email, cédula o cuenta). */

export const PROMOTIONAL_MAX_USES_PER_USER = 1;



export type ScheduleCheck = "VALID" | "NOT_STARTED" | "EXPIRED" | "NO_SCHEDULE";



export interface CouponEligibilityInput {

  kind?: CouponKind;

  isUsed: boolean;

  assignedEmail: string | null;

  isActive?: boolean;

  expiresAt?: Date | string | null;

  scheduleMode?: CouponScheduleMode | string | null;

  validFrom?: Date | string | null;

  validTo?: Date | string | null;

  maxGlobalUses?: number | null;

  currentGlobalUses?: number;

  maxUsesPerUser?: number;

}



export interface CouponUsageCountInput {

  email: string;

  documentId: string;

  userId?: string | null;

}



export function isPromotionalCoupon(kind?: CouponKind | string | null): boolean {

  return kind === "PROMOTIONAL";

}



function toDate(value: Date | string): Date {

  return value instanceof Date ? value : new Date(value);

}



export function isCouponExpired(expiresAt?: Date | string | null, now: Date = new Date()): boolean {

  if (!expiresAt) return false;

  const expiry = toDate(expiresAt);

  return expiry.getTime() <= now.getTime();

}



export function getCouponScheduleStatus(

  coupon: Pick<

    CouponEligibilityInput,

    "scheduleMode" | "validFrom" | "validTo" | "expiresAt"

  >,

  now: Date = new Date()

): ScheduleCheck {

  const mode = (coupon.scheduleMode ?? "NONE") as CouponScheduleMode;



  if (mode === "NONE") {

    if (coupon.expiresAt && isCouponExpired(coupon.expiresAt, now)) {

      return "EXPIRED";

    }

    return "NO_SCHEDULE";

  }



  if (!coupon.validFrom || !coupon.validTo) {

    return "NO_SCHEDULE";

  }



  const from = toDate(coupon.validFrom);

  const to = toDate(coupon.validTo);

  const nowMs = now.getTime();



  if (nowMs < from.getTime()) return "NOT_STARTED";

  if (nowMs > to.getTime()) return "EXPIRED";

  return "VALID";

}



export function isCouponWithinSchedule(

  coupon: Pick<

    CouponEligibilityInput,

    "scheduleMode" | "validFrom" | "validTo" | "expiresAt"

  >,

  now: Date = new Date()

): boolean {

  const status = getCouponScheduleStatus(coupon, now);

  return status === "VALID" || status === "NO_SCHEDULE";

}



export function isCouponGloballyAvailable(

  coupon: CouponEligibilityInput | null | undefined,

  now: Date = new Date()

): boolean {

  if (!coupon) return false;

  if (coupon.isActive === false) return false;

  if (!isCouponWithinSchedule(coupon, now)) return false;



  if (isPromotionalCoupon(coupon.kind)) {

    const max = coupon.maxGlobalUses ?? 0;

    const current = coupon.currentGlobalUses ?? 0;

    return current < max;

  }



  return !coupon.isUsed;

}



export function isCouponEligibleForEmail(

  coupon: CouponEligibilityInput | null | undefined,

  email: string

): boolean {

  if (!coupon) return false;



  if (isPromotionalCoupon(coupon.kind)) {

    if (!isCouponGloballyAvailable(coupon)) return false;

    return true;

  }



  if (coupon.isUsed) return false;



  if (coupon.assignedEmail) {

    return coupon.assignedEmail.toLowerCase() === email.toLowerCase();

  }



  return true;

}



export function hasUserExceededCouponLimit(

  previousUsageCount: number,

  maxUsesPerUser: number

): boolean {

  return previousUsageCount >= maxUsesPerUser;

}



export function calculateCouponDiscount(subtotal: number, percentage: number): number {

  return calculateCouponDiscountAmount(subtotal, "PERCENTAGE", percentage);

}



export function calculateCouponDiscountAmount(

  subtotal: number,

  discountType: CouponDiscountType,

  discountValue: number

): number {

  if (discountValue <= 0 || subtotal <= 0) return 0;



  if (discountType === "FIXED") {

    return Math.min(discountValue, subtotal);

  }



  if (discountValue > 100) return Math.round(subtotal);

  return Math.round((subtotal * discountValue) / 100);

}



export function formatCouponDiscountLabel(

  discountType: CouponDiscountType,

  discountValue: number

): string {

  if (discountType === "FIXED") {

    return `$${discountValue.toLocaleString("es-CO")}`;

  }

  return `${discountValue}%`;

}



export function getPromotionalCouponStatus(

  coupon: Pick<

    CouponEligibilityInput,

    | "isActive"

    | "expiresAt"

    | "scheduleMode"

    | "validFrom"

    | "validTo"

    | "maxGlobalUses"

    | "currentGlobalUses"

  >,

  now: Date = new Date()

): "ACTIVE" | "EXHAUSTED" | "INACTIVE" | "EXPIRED" | "SCHEDULED" {

  if (coupon.isActive === false) return "INACTIVE";



  const scheduleStatus = getCouponScheduleStatus(coupon, now);

  if (scheduleStatus === "NOT_STARTED") return "SCHEDULED";

  if (scheduleStatus === "EXPIRED") return "EXPIRED";



  const max = coupon.maxGlobalUses ?? 0;

  const current = coupon.currentGlobalUses ?? 0;

  if (current >= max) return "EXHAUSTED";

  return "ACTIVE";

}


