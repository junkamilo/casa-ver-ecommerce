import { parsePosLineId } from "@/modules/posIntegration/domain/pos-mapper";
import {
  isPosCatalogConfigured,
  validatePosPromotion,
} from "@/modules/posIntegration/infrastructure/pos-catalog.client";
import type { PosPromotionValidation } from "@/modules/posIntegration/contracts/pos-catalog.schema";

/** Línea del carrito a validar: `price` es el precio unitario (el del POS al crear la orden). */
export type CouponQuoteLine = { variantId: string; productId: string; price: number; quantity: number };

export type CouponDiscountType = "PERCENTAGE" | "FIXED";

export type CouponQuote =
  | {
      valid: true;
      /** promotionId del POS (PRM-año-número): va en el pedido para que el POS registre el uso. */
      promotionId: string;
      code: string;
      kind: "PROMOTIONAL" | "BATCH" | "EMAIL";
      name: string | null;
      discountType: CouponDiscountType;
      discountValue: number;
      minPurchase: number | null;
      /** Alcance: con PRODUCTS o CATEGORIES el descuento solo cae en algunas líneas. */
      wholeOrder: boolean;
      /** Descuento total calculado por el POS (pesos enteros). */
      discountAmount: number;
      /** Descuento de cada línea, en el mismo orden de `lines` (0 = no elegible). */
      lineDiscounts: number[];
      /** Variantes del carrito a las que aplica (solo con alcance). */
      eligibleVariantIds: string[] | null;
    }
  | { valid: false; reason: string; message: string };

export const POS_UNAVAILABLE_MESSAGE =
  "No pudimos validar el cupón en este momento. Intenta de nuevo en unos segundos.";

/** Normaliza como el POS: sin espacios y en mayúsculas. */
export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Slug del POS de cada línea (lo trae el SKU del POS en el `variantId`). Sin slug = línea que no es del POS
 * (cuenta para «todo el pedido», no para un alcance; el checkout la rechaza de todos modos).
 */
async function posSlugsOf(lines: CouponQuoteLine[]): Promise<(string | null)[]> {
  return lines.map((l) => parsePosLineId(l.variantId)?.slug ?? null);
}

/** Respuesta del POS → resultado del checkout (puro, para probarlo sin red). */
export function toCouponQuote(
  result: PosPromotionValidation,
  lines: CouponQuoteLine[],
  code: string,
): CouponQuote {
  if (!result.valid || !result.promotionId || !result.discountType || result.discountValue == null) {
    return {
      valid: false,
      reason: result.reason ?? "COUPON_NOT_FOUND",
      message: result.message ?? "El cupón no es válido",
    };
  }
  const lineDiscounts = lines.map(() => 0);
  for (const line of result.lineDiscounts) {
    if (line.index >= 0 && line.index < lines.length) lineDiscounts[line.index] += Math.round(line.discount);
  }
  const wholeOrder = !result.scopeType || result.scopeType === "ORDER";
  return {
    valid: true,
    promotionId: result.promotionId,
    code: result.code ?? code,
    kind: result.kind ?? "PROMOTIONAL",
    name: result.name,
    discountType: result.discountType,
    discountValue: result.discountValue,
    minPurchase: result.minPurchase,
    wholeOrder,
    discountAmount: Math.round(result.discountAmount),
    lineDiscounts,
    eligibleVariantIds: wholeOrder
      ? null
      : lines.filter((_, i) => lineDiscounts[i] > 0).map((l) => l.variantId),
  };
}

/**
 * Valida el cupón contra el POS (POST /api/public/promotions/validate): el POS es la única autoridad de
 * cupones; la web no guarda ni recalcula descuentos. `email` y `document` controlan el uso por persona y
 * el dueño de los cupones de bienvenida. Si el POS no responde, el cupón no se acepta.
 */
export async function quoteCouponWithPos(input: {
  code: string;
  email?: string | null;
  document?: string | null;
  lines: CouponQuoteLine[];
}): Promise<CouponQuote> {
  const code = normalizeCouponCode(input.code ?? "");
  if (!code) return { valid: false, reason: "CODE_REQUIRED", message: "Código requerido" };
  if (!isPosCatalogConfigured()) {
    return { valid: false, reason: "POS_UNAVAILABLE", message: POS_UNAVAILABLE_MESSAGE };
  }
  try {
    const slugs = await posSlugsOf(input.lines);
    const result = await validatePosPromotion({
      code,
      customerEmail: input.email?.trim().toLowerCase() || null,
      customerDocument: input.document?.trim() || null,
      lines: input.lines.map((line, index) => {
        const ref = parsePosLineId(line.variantId);
        return {
          index,
          productSlug: slugs[index],
          colorId: ref?.colorId ?? null,
          sizeId: ref?.sizeId ?? null,
          quantity: line.quantity,
          unitPrice: line.price,
        };
      }),
    });
    return toCouponQuote(result, input.lines, code);
  } catch (error) {
    console.error("[coupon] El POS no validó el cupón:", error);
    return { valid: false, reason: "POS_UNAVAILABLE", message: POS_UNAVAILABLE_MESSAGE };
  }
}
