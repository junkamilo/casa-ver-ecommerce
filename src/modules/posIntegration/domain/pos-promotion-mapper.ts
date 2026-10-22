import type { PosPromotion } from "../contracts/pos-catalog.schema";

/** Día calendario en Bogotá (YYYY-MM-DD). */
function bogotaDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(date);
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Cupones de lote del POS: cada código es un `Coupon` BATCH_SINGLE con
 * `posPromotionId = "<promotionId>:<código>"` (la columna es única). Así se encuentran todos los
 * cupones de una promoción y cada uno conserva su propio estado de uso.
 */
export const BATCH_KEY_SEPARATOR = ":";

export function batchCouponKey(promotionId: string, code: string): string {
  return `${promotionId}${BATCH_KEY_SEPARATOR}${code}`;
}

/** promotionId del POS a partir del posPromotionId guardado en el cupón (simple o de lote). */
export function posPromotionIdOf(posPromotionId: string | null | undefined): string | null {
  if (!posPromotionId) return null;
  const index = posPromotionId.indexOf(BATCH_KEY_SEPARATOR);
  return index === -1 ? posPromotionId : posPromotionId.slice(0, index);
}

/**
 * Campos del `Coupon` de la web que salen de una promoción del POS (B.7). El alcance llega con
 * identificadores públicos (slugs y webIds); el repositorio los traduce a ids de la web.
 * Nunca incluye `currentGlobalUses`: los usos de la web los cuenta la web.
 */
export interface MappedPosPromotion {
  posPromotionId: string;
  kind: "PROMOTIONAL" | "BATCH";
  /** PROMOTIONAL: el código compartido. BATCH: null (ver `batchCodes`). */
  code: string;
  /** BATCH: códigos de un solo uso y si ya se usaron (en la tienda o en la web). */
  batchCodes: { code: string; used: boolean }[];
  label: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  discountPercentage: number;
  maxGlobalUses: number;
  maxUsesPerUser: number;
  scheduleMode: "NONE" | "SINGLE_DAY" | "DATE_RANGE";
  validFrom: Date | null;
  validTo: Date | null;
  isActive: boolean;
  minPurchase: number | null;
  scopeType: "ORDER" | "PRODUCTS" | "CATEGORIES";
  scopeProductSlugs: string[];
  scopeCategoryWebIds: string[];
  /** La promoción no incluye el canal WEB: la web no la guarda (o la desactiva si ya existía). */
  forWeb: boolean;
}

export function mapPosPromotion(p: PosPromotion): MappedPosPromotion {
  const validFrom = parseDate(p.startsAt);
  const validTo = parseDate(p.endsAt);
  const scheduled = Boolean(validFrom && validTo);
  const sameBogotaDay = scheduled && bogotaDay(validFrom!) === bogotaDay(new Date(validTo!.getTime() - 1));
  const forWeb = p.channels.includes("WEB");
  const batch = p.kind === "BATCH";
  return {
    posPromotionId: p.promotionId,
    kind: p.kind,
    code: batch ? "" : (p.code ?? ""),
    batchCodes: batch ? p.codes.map((c) => ({ code: c.code, used: c.used })) : [],
    label: p.name,
    discountType: p.discountType,
    discountValue: p.discountValue,
    discountPercentage: p.discountType === "PERCENTAGE" ? p.discountValue : 0,
    // Lote: cada código se usa una vez. Promocional: el cupo de usos de la web.
    maxGlobalUses: batch ? 1 : p.maxUses,
    // La web solo admite 1 uso por persona (correo, cédula o usuario).
    maxUsesPerUser: 1,
    scheduleMode: !scheduled ? "NONE" : sameBogotaDay ? "SINGLE_DAY" : "DATE_RANGE",
    validFrom: scheduled ? validFrom : null,
    validTo: scheduled ? validTo : null,
    isActive: p.active && forWeb,
    minPurchase: p.minPurchase && p.minPurchase > 0 ? p.minPurchase : null,
    scopeType: p.scope.type,
    scopeProductSlugs: p.scope.type === "PRODUCTS" ? p.scope.productSlugs.map((s) => s.toLowerCase()) : [],
    scopeCategoryWebIds: p.scope.type === "CATEGORIES" ? p.scope.categoryWebIds : [],
    forWeb,
  };
}
