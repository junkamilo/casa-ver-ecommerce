// Errores tipados del submódulo product. Las Server Actions traducen estos
// errores al contrato `{ success: false, error: string }` que consume
// `ReviewForm.tsx`. Por eso preferimos errores con `userMessage` legible.

export class ProductError extends Error {
  public readonly userMessage: string;

  constructor(userMessage: string, name: string) {
    super(userMessage);
    this.name = name;
    this.userMessage = userMessage;
  }
}

export class ProductNotFoundError extends ProductError {
  constructor() {
    super("Producto no encontrado", "ProductNotFoundError");
  }
}

export class ProductInactiveError extends ProductError {
  constructor() {
    super("No puedes reseñar este producto", "ProductInactiveError");
  }
}

export class ReviewNotAuthenticatedError extends ProductError {
  constructor(action: "save" | "delete" = "save") {
    super(
      action === "save"
        ? "Debes iniciar sesión para calificar"
        : "Debes iniciar sesión para eliminar tu reseña",
      "ReviewNotAuthenticatedError",
    );
  }
}

export class ReviewNotPurchasedError extends ProductError {
  constructor() {
    super(
      "Solo puedes reseñar productos que hayas comprado",
      "ReviewNotPurchasedError",
    );
  }
}

export class ReviewNotFoundError extends ProductError {
  constructor() {
    super("No tienes una reseña para eliminar", "ReviewNotFoundError");
  }
}

export class InvalidProductIdError extends ProductError {
  constructor() {
    super("Producto inválido", "InvalidProductIdError");
  }
}

export class ReviewValidationError extends ProductError {
  constructor(message: string) {
    super(message, "ReviewValidationError");
  }
}
