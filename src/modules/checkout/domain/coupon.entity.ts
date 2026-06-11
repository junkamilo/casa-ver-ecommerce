// Predicados puros del dominio Cupón en el contexto del checkout.
//
// Reglas extraídas byte-a-byte del bloque de cupón en `createOrder`:
//   - El cupón es válido si: existe + no está usado + el assignedEmail coincide
//     (case-insensitive) con el email del comprador.
//   - El descuento se calcula como porcentaje del subtotal real (server-side)
//     y se redondea con Math.round.

export interface CouponEligibilityInput {
  isUsed: boolean;
  assignedEmail: string;
}

export function isCouponEligibleForEmail(
  coupon: CouponEligibilityInput | null | undefined,
  email: string
): boolean {
  if (!coupon) return false;
  if (coupon.isUsed) return false;
  return coupon.assignedEmail.toLowerCase() === email.toLowerCase();
}

export function calculateCouponDiscount(subtotal: number, percentage: number): number {
  if (percentage <= 0) return 0;
  return Math.round((subtotal * percentage) / 100);
}
