// Funciones puras de cupones que quedan en la web: la vigencia (la usan los popups de publicidad) y la vista
// previa del descuento en el checkout. Validar un cupón y calcular su descuento real lo hace el POS
// (POST /api/public/promotions/validate); la web no guarda cupones.

import type { CouponScheduleMode } from "./coupon-schedule";
import { formatCouponScheduleLabel } from "./coupon-schedule";

export type { CouponScheduleMode };
export { formatCouponScheduleLabel };

export type CouponDiscountType = "PERCENTAGE" | "FIXED";

export type ScheduleCheck = "VALID" | "NOT_STARTED" | "EXPIRED" | "NO_SCHEDULE";

export interface CouponScheduleInput {
  expiresAt?: Date | string | null;
  scheduleMode?: CouponScheduleMode | string | null;
  validFrom?: Date | string | null;
  validTo?: Date | string | null;
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function isCouponExpired(expiresAt?: Date | string | null, now: Date = new Date()): boolean {
  if (!expiresAt) return false;
  const expiry = toDate(expiresAt);
  return expiry.getTime() <= now.getTime();
}

export function getCouponScheduleStatus(coupon: CouponScheduleInput, now: Date = new Date()): ScheduleCheck {
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

export function isCouponWithinSchedule(coupon: CouponScheduleInput, now: Date = new Date()): boolean {
  const status = getCouponScheduleStatus(coupon, now);
  return status === "VALID" || status === "NO_SCHEDULE";
}

/**
 * Vista previa del descuento (misma regla del POS): fijo = min(valor, base); porcentaje = base × valor / 100
 * redondeado. El descuento cobrado es el que calcula el POS al crear la orden.
 */
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

export function formatCouponDiscountLabel(discountType: CouponDiscountType, discountValue: number): string {
  if (discountType === "FIXED") {
    return `$${discountValue.toLocaleString("es-CO")}`;
  }
  return `${discountValue}%`;
}
