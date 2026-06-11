export class OrderAdminUnauthorizedError extends Error {
  constructor(message = "No autorizado") {
    super(message);
    this.name = "OrderAdminUnauthorizedError";
  }
}

export class OrderAdminValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderAdminValidationError";
  }
}

export class OrderAdminNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderAdminNotFoundError";
  }
}
