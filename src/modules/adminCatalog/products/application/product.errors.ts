export class ProductValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductValidationError";
  }
}

export class ProductConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductConflictError";
  }
}

export class ProductNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductNotFoundError";
  }
}

export class ProductPosManagedConflictError extends Error {
  constructor(
    message = "Este producto lo administra el POS: cámbialo allí. En la web solo se editan SEO, portada, etiquetas y sugeridos."
  ) {
    super(message);
    this.name = "ProductPosManagedConflictError";
  }
}

export class ProductOwnershipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductOwnershipError";
  }
}
