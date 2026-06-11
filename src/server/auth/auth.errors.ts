export class UnauthenticatedError extends Error {
  constructor(message = "No autenticado") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "No autorizado") {
    super(message);
    this.name = "ForbiddenError";
  }
}
