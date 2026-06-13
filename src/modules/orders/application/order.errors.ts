export class OrderPaymentGraceExpiredError extends Error {
  constructor(
    message = "El tiempo para completar el pago de esta orden ha expirado"
  ) {
    super(message);
    this.name = "OrderPaymentGraceExpiredError";
  }
}
