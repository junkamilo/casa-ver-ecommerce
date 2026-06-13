export class CouponValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CouponValidationError";
  }
}

export class CouponNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CouponNotFoundError";
  }
}

export class CouponConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CouponConflictError";
  }
}
