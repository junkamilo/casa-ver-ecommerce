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

/** Cupones de promociones del POS: se administran en el POS (Tienda → Promociones). */
export const POS_MANAGED_MESSAGE = "Esta promoción la administra el POS";
