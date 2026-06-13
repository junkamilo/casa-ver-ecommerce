// Errores tipados del módulo Checkout.
//
// Importante: el Server Action `createOrder` actual NO lanza nunca; mapea
// cualquier excepción a `{ success: false, error: string }`. Para preservar
// ese contrato, el use case CAPTURA estos errores internamente y los
// convierte en `{ success: false, error }` (igual que el código legacy).
//
// Aun así los tipos siguen siendo útiles dentro del use case y del repo
// para distinguir orígenes y dejar mensajes claros.

export class CheckoutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutValidationError";
  }
}

export class CartEmptyError extends Error {
  constructor(message = "El carrito está vacío") {
    super(message);
    this.name = "CartEmptyError";
  }
}

export class OutOfStockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OutOfStockError";
  }
}

export class ProductUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductUnavailableError";
  }
}

export class VariantNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VariantNotFoundError";
  }
}

export class InvalidAddressError extends Error {
  constructor(message = "Dirección de envío inválida") {
    super(message);
    this.name = "InvalidAddressError";
  }
}

export class CouponNotYetValidError extends Error {
  constructor(message = "El cupón aún no está disponible") {
    super(message);
    this.name = "CouponNotYetValidError";
  }
}

export class CouponExpiredError extends Error {
  constructor(message = "El cupón ha expirado") {
    super(message);
    this.name = "CouponExpiredError";
  }
}

export class CouponExhaustedError extends Error {
  constructor(message = "El cupón ya no tiene usos disponibles") {
    super(message);
    this.name = "CouponExhaustedError";
  }
}

export class CouponInactiveError extends Error {
  constructor(message = "El cupón no está activo") {
    super(message);
    this.name = "CouponInactiveError";
  }
}

export class CouponAlreadyUsedError extends Error {
  constructor(message = "Este cupón ya fue utilizado por ti") {
    super(message);
    this.name = "CouponAlreadyUsedError";
  }
}
