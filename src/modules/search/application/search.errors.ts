export class RateLimitExceededError extends Error {
    public retryAfter: string;
    public limit: string;
  
    constructor(retryAfter: number, limit: number, message: string = "Demasiadas solicitudes. Intenta de nuevo más tarde.") {
      super(message);
      this.name = "RateLimitExceededError";
      this.retryAfter = String(retryAfter);
      this.limit = String(limit);
    }
  }