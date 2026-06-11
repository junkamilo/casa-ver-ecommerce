export class AccountUnauthorizedError extends Error {
    constructor(message: string = "No autorizado") {
      super(message);
      this.name = "AccountUnauthorizedError";
    }
  }