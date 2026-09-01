export class HeroUnauthorizedError extends Error {
  constructor(message: string = "Acceso denegado") {
    super(message);
    this.name = "HeroUnauthorizedError";
  }
}

export class HeroValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HeroValidationError";
  }
}

export class HeroNotFoundError extends Error {
  constructor(message: string = "Slide no encontrado") {
    super(message);
    this.name = "HeroNotFoundError";
  }
}
