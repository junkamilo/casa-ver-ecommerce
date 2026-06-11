export class BoldFallbackUnauthorizedError extends Error {
    constructor(message: string = "Acceso no autorizado al fallback de Bold") {
      super(message);
      this.name = "BoldFallbackUnauthorizedError";
    }
  }
  
  export class BoldFallbackConfigError extends Error {
    constructor(message: string = "Configuración faltante en variables de entorno") {
      super(message);
      this.name = "BoldFallbackConfigError";
    }
  }