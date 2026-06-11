// Errores tipados del módulo Bold. Aprovechan el sufijo automático de
// src/server/http/error-response.ts:
//   *ValidationError → 400
//   *NotFoundError   → 404
//   *ConflictError   → 409
//   resto            → 500

export class BoldValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BoldValidationError";
  }
}

export class BoldOrderNotFoundError extends Error {
  constructor(message = "Orden no encontrada") {
    super(message);
    this.name = "BoldOrderNotFoundError";
  }
}

export class BoldOrderConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BoldOrderConflictError";
  }
}

export class BoldForbiddenError extends Error {
  constructor(message = "Acceso denegado") {
    super(message);
    this.name = "BoldForbiddenError";
  }
}

// Para errores upstream (Bold API down/error). El handler debe mapear a
// 502 explícitamente; el sufijo genérico devolvería 500.
export class BoldGatewayError extends Error {
  readonly status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "BoldGatewayError";
    this.status = status;
  }
}

// Configuración de entorno faltante (BOLD_IDENTITY_KEY, NEXT_PUBLIC_APP_URL…).
export class BoldConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BoldConfigError";
  }
}
