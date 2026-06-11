export class ColorValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ColorValidationError";
  }
}

export class ColorConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ColorConflictError";
  }
}

export class ColorNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ColorNotFoundError";
  }
}
