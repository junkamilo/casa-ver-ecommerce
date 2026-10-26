// Alcance de los cupones: todo el pedido, productos o categorías. Lo evalúa el POS al validar el cupón
// (POST /api/public/promotions/validate); la web solo muestra el resultado.

export type CouponScopeType = "ORDER" | "PRODUCTS" | "CATEGORIES";

/** Mensaje de compra mínima (mismo texto que el POS) para la vista previa del checkout. */
export function minPurchaseMessage(minPurchase: number): string {
  return `Compra mínima de $${Math.round(minPurchase).toLocaleString("es-CO")} para usar este cupón`;
}
