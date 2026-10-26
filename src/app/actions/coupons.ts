"use server";

import type { CouponDiscountType } from "@/modules/checkout/domain/coupon.entity";
import { quoteCouponWithPos } from "@/modules/checkout/infrastructure/pos-coupon";
import {
  isPosCatalogConfigured,
  issuePosPromotionCode,
} from "@/modules/posIntegration/infrastructure/pos-catalog.client";

/**
 * Cupones de la tienda: 100 % del POS (md/COMPARACION-TABLAS-PROMOCIONES-POS-vs-WEB.md). La web no guarda
 * cupones: el POS los crea, los valida y calcula el descuento; aquí solo se le pregunta.
 */

/** Línea del carrito para validar compra mínima y alcance (precio mostrado; el servidor recalcula al pagar). */
export type CouponCartLine = { variantId: string; productId?: string; price: number; quantity: number };

/** Promoción de bienvenida del POS (V107 la crea como PRM-WELCOME-10); se puede cambiar por entorno. */
const WELCOME_PROMOTION_ID = process.env.POS_WELCOME_PROMOTION_ID?.trim() || "PRM-WELCOME-10";

// ---------------------------------------------------------------------------
// generateFirstPurchaseCoupon
// Se llama cuando un email se registra por primera vez (en register o newsletter). El POS emite un cupón
// único del 10 % ligado a ese email (POST /api/public/promotions/{promotionId}/codes). Idempotente: si el
// correo ya tenía cupón, el POS devuelve el mismo.
// ---------------------------------------------------------------------------
export async function generateFirstPurchaseCoupon(email: string): Promise<{ success: boolean; code?: string; error?: string }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Email inválido" };
  }
  if (!isPosCatalogConfigured()) {
    return { success: false, error: "Error al generar el cupón" };
  }

  try {
    const issued = await issuePosPromotionCode(WELCOME_PROMOTION_ID, email.toLowerCase().trim());
    return { success: true, code: issued.code };
  } catch (err) {
    console.error("[generateFirstPurchaseCoupon] Error:", err);
    return { success: false, error: "Error al generar el cupón" };
  }
}

export type ValidateCouponResult = {
  valid: boolean;
  /** Código normalizado (el que se envía al crear la orden). */
  code?: string;
  discountPercentage?: number;
  discountType?: CouponDiscountType;
  discountValue?: number;
  /** Descuento calculado por el POS para el carrito enviado. */
  discountAmount?: number;
  /** promotionId del POS (PRM-año-número). */
  promotionId?: string;
  error?: string;
  /** Motivo estable del POS cuando no aplica (COUPON_EXPIRED, EMAIL_REQUIRED, ...). */
  reason?: string;
  minPurchase?: number | null;
  /** Variantes del carrito a las que aplica (solo si el cupón tiene alcance); el descuento se calcula sobre ellas. */
  eligibleVariantIds?: string[];
};

// ---------------------------------------------------------------------------
// validateCoupon — aplicar código en el checkout
// El POS valida vigencia, cupo, uso por persona, dueño (bienvenida), compra mínima y alcance, y calcula el
// descuento. Al crear la orden se vuelve a validar con los precios reales.
// ---------------------------------------------------------------------------
export async function validateCoupon(
  code: string,
  email?: string,
  items?: CouponCartLine[],
  document?: string
): Promise<ValidateCouponResult> {
  if (!code) {
    return { valid: false, error: "Código requerido" };
  }

  const lines = (items ?? []).map((item) => ({
    variantId: item.variantId,
    productId: item.productId ?? item.variantId,
    price: item.price,
    quantity: item.quantity,
  }));
  const quote = await quoteCouponWithPos({ code, email, document, lines });

  if (!quote.valid) {
    return { valid: false, error: quote.message, reason: quote.reason };
  }
  return {
    valid: true,
    code: quote.code,
    discountType: quote.discountType,
    discountValue: quote.discountValue,
    discountPercentage: quote.discountType === "PERCENTAGE" ? quote.discountValue : undefined,
    discountAmount: quote.discountAmount,
    promotionId: quote.promotionId,
    minPurchase: quote.minPurchase,
    eligibleVariantIds: quote.eligibleVariantIds ?? undefined,
  };
}
