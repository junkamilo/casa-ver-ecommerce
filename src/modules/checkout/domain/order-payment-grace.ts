/** Ventana de gracia para completar el pago tras crear la orden (Flash Sales snapshot). */
export const ORDER_PAYMENT_GRACE_MS = 30 * 60 * 1000;

export function computeOrderPaymentExpiresAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + ORDER_PAYMENT_GRACE_MS);
}

export function isOrderWithinPaymentGrace(
  paymentExpiresAt: Date | string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!paymentExpiresAt) return true;
  const expiry =
    paymentExpiresAt instanceof Date ? paymentExpiresAt : new Date(paymentExpiresAt);
  return now.getTime() <= expiry.getTime();
}
