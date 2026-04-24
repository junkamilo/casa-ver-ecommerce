export class EmailTestUnauthorizedError extends Error {
    constructor(message: string = "No autorizado. Se requiere rol ADMIN o CLI Secret válido.") {
      super(message);
      this.name = "EmailTestUnauthorizedError";
    }
  }
  
  export class EmailTestValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "EmailTestValidationError";
    }
  }
  
  export class EmailConfigUnavailableError extends Error {
    public warnings: string[];
    constructor(message: string, warnings: string[] = []) {
      super(message);
      this.name = "EmailConfigUnavailableError";
      this.warnings = warnings;
    }
  }