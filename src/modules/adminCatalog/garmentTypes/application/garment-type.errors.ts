export class GarmentTypeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GarmentTypeValidationError";
  }
}

export class GarmentTypeConflictError extends Error {
  readonly details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "GarmentTypeConflictError";
    this.details = details;
  }
}

export class GarmentTypeNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GarmentTypeNotFoundError";
  }
}
