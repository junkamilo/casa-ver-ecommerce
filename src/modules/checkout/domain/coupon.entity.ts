// Predicados puros del dominio Cupón en el contexto del checkout.
//
// Reglas:
//   - Cupón legacy (assignedEmail != null): debe coincidir con el email del comprador.
//   - Cupón abierto (assignedEmail == null): elegible si no está usado;
//     la verificación de usuario registrado se hace fuera (validateCoupon / createOrder).

export interface CouponEligibilityInput {
  isUsed: boolean;
  assignedEmail: string | null;
}

export function isCouponEligibleForEmail(
  coupon: CouponEligibilityInput | null | undefined,
  email: string
): boolean {
  if (!coupon) return false;
  if (coupon.isUsed) return false;

  if (coupon.assignedEmail) {
    return coupon.assignedEmail.toLowerCase() === email.toLowerCase();
  }

  return true;
}

export function calculateCouponDiscount(subtotal: number, percentage: number): number {
  if (percentage <= 0) return 0;
  return Math.round((subtotal * percentage) / 100);
}
