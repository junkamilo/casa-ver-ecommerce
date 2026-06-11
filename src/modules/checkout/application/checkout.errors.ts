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
