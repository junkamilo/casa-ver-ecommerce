"use server";

import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import {
  calculateCouponDiscountAmount,
  isCouponEligibleForEmail,
  isCouponGloballyAvailable,
  isPromotionalCoupon,
  type CouponDiscountType,
  type CouponKind,
} from "@/modules/checkout/domain/coupon.entity";
import { validateCouponTimeWindow } from "@/modules/checkout/domain/validate-coupon-time-window";

// ---------------------------------------------------------------------------
// generateFirstPurchaseCoupon
// Se llama cuando un email se registra por primera vez (en register o newsletter).
// Crea un cupón único del 10% vinculado a ese email. Idempotente.
// ---------------------------------------------------------------------------
export async function generateFirstPurchaseCoupon(email: string): Promise<{ success: boolean; code?: string; error?: string }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Email inválido" };
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existing = await prisma.coupon.findFirst({
      where: { assignedEmail: normalizedEmail, isUsed: false, kind: "EMAIL_SINGLE" },
    });

    if (existing) {
      return { success: true, code: existing.code };
    }

    const code = `CV-${randomBytes(5).toString("hex").toUpperCase()}`;

    const coupon = await prisma.coupon.create({
      data: {
        code,
        kind: "EMAIL_SINGLE",
        discountType: "PERCENTAGE",
        discountValue: 10,
        discountPercentage: 10,
        assignedEmail: normalizedEmail,
        isUsed: false,
        maxGlobalUses: 1,
      },
    });

    return { success: true, code: coupon.code };
  } catch (err) {
    console.error("[generateFirstPurchaseCoupon] Error:", err);
    return { success: false, error: "Error al generar el cupón" };
  }
}

export type ValidateCouponResult = {
  valid: boolean;
  discountPercentage?: number;
  discountType?: CouponDiscountType;
  discountValue?: number;
  couponId?: string;
  kind?: CouponKind;
  error?: string;
};

// ---------------------------------------------------------------------------
// validateCoupon — Fase 1 (aplicar código en checkout)
// ---------------------------------------------------------------------------
export async function validateCoupon(
  code: string,
  email?: string
): Promise<ValidateCouponResult> {
  if (!code) {
    return { valid: false, error: "Código requerido" };
  }

  const normalizedCode = code.toUpperCase().trim();

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon) {
      return { valid: false, error: "El cupón no existe" };
    }

    if (isPromotionalCoupon(coupon.kind)) {
      if (coupon.isActive === false) {
        return { valid: false, error: "El cupón no está activo" };
      }
      try {
        validateCouponTimeWindow(coupon);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Cupón no válido";
        return { valid: false, error: message };
      }
      if (!isCouponGloballyAvailable(coupon)) {
        return { valid: false, error: "El cupón ya no tiene usos disponibles" };
      }

      return {
        valid: true,
        discountType: coupon.discountType as CouponDiscountType,
        discountValue: coupon.discountValue,
        discountPercentage:
          coupon.discountType === "PERCENTAGE" ? coupon.discountValue : undefined,
        couponId: coupon.id,
        kind: coupon.kind as CouponKind,
      };
    }

    if (!email) {
      return { valid: false, error: "Correo requerido para validar este cupón" };
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (coupon.isUsed) {
      return { valid: false, error: "El cupón ya fue utilizado" };
    }

    if (!isCouponEligibleForEmail(coupon, normalizedEmail)) {
      return { valid: false, error: "El cupón no pertenece a este correo" };
    }

    if (coupon.assignedEmail) {
      if (coupon.assignedEmail !== normalizedEmail) {
        return { valid: false, error: "El cupón no pertenece a este correo" };
      }
    } else {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });
      if (!user) {
        return { valid: false, error: "Debes registrarte para usar este cupón" };
      }
    }

    return {
      valid: true,
      discountType: "PERCENTAGE",
      discountValue: coupon.discountValue ?? coupon.discountPercentage,
      discountPercentage: coupon.discountPercentage,
      couponId: coupon.id,
      kind: (coupon.kind ?? "BATCH_SINGLE") as CouponKind,
    };
  } catch (err) {
    console.error("[validateCoupon] Error:", err);
    return { valid: false, error: "Error al validar el cupón" };
  }
}

export { calculateCouponDiscountAmount };
