// Alcance de los cupones (promociones del POS): todo el pedido, productos o categorías.
// docs/promociones-web-y-pos.md, B.9. Funciones puras: el acceso a la BD está en coupon-eligibility.ts.

export type CouponScopeType = "ORDER" | "PRODUCTS" | "CATEGORIES";

export interface CouponScope {
  scopeType: CouponScopeType;
  scopeProductIds: string[];
  scopeCategoryIds: string[];
}

export interface ScopedLine {
  variantId: string;
  productId: string | null;
  price: number;
  quantity: number;
}

/** Cupones creados antes del alcance (o en el admin web) aplican a todo el pedido. */
export function isWholeOrder(scope: Partial<CouponScope> | null | undefined): boolean {
  return !scope?.scopeType || scope.scopeType === "ORDER";
}

/**
 * ¿El producto entra en el alcance? Categorías: la del producto o su categoría padre (una promoción
 * de «Vestidos» incluye «Vestidos largos»).
 */
export function isProductInScope(
  scope: CouponScope,
  productId: string | null,
  productCategories: { id: string; parentId: string | null }[] = [],
): boolean {
  if (isWholeOrder(scope)) return true;
  if (!productId) return false;
  if (scope.scopeType === "PRODUCTS") return scope.scopeProductIds.includes(productId);
  const wanted = new Set(scope.scopeCategoryIds);
  return productCategories.some((c) => wanted.has(c.id) || (c.parentId !== null && wanted.has(c.parentId)));
}

/** Subtotal de las líneas elegibles: es la base del descuento. */
export function eligibleSubtotal(lines: ScopedLine[], eligibleVariantIds: Set<string>): number {
  return lines
    .filter((line) => eligibleVariantIds.has(line.variantId))
    .reduce((sum, line) => sum + line.price * line.quantity, 0);
}

/** Mensaje de compra mínima (mismo texto en la validación y al crear la orden). */
export function minPurchaseMessage(minPurchase: number): string {
  return `Compra mínima de $${Math.round(minPurchase).toLocaleString("es-CO")} para usar este cupón`;
}

export const OUT_OF_SCOPE_MESSAGE = "El cupón no aplica a los productos de tu carrito";
