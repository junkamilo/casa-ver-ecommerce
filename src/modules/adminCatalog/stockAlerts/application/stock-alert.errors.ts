export class StockAlertValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StockAlertValidationError";
  }
}

export class StockAlertRateLimitError extends Error {
  readonly retryAfter: string;
  readonly limit: string;

  constructor(retryAfter: number | null, limit: number, message = "Demasiadas solicitudes. Intenta de nuevo más tarde.") {
    super(message);
    this.name = "StockAlertRateLimitError";
    this.retryAfter = String(retryAfter ?? 60);
    this.limit = String(limit);
  }
}
