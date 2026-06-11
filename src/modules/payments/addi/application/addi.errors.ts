// Errores tipados del módulo Addi. Aprovechan el sufijo automático de
// src/server/http/error-response.ts:
//   *ValidationError → 400
//   *NotFoundError   → 404
//   *ConflictError   → 409
//   *ForbiddenError  → 403
//   resto            → 500
// Errores con propiedad `status` numérica devuelven ese status (BoldGatewayError).

export class AddiValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AddiValidationError";
  }
}

export class AddiOrderNotFoundError extends Error {
  constructor(message = "Orden no encontrada") {
    super(message);
    this.name = "AddiOrderNotFoundError";
  }
}

export class AddiOrderConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AddiOrderConflictError";
  }
}

export class AddiForbiddenError extends Error {
  constructor(message = "Acceso denegado") {
    super(message);
    this.name = "AddiForbiddenError";
  }
}

export class AddiUnauthorizedError extends Error {
  // Usa `status` explícito porque el sufijo "UnauthorizedError" no está
  // cubierto por el mapper genérico.
  readonly status = 401;
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AddiUnauthorizedError";
  }
}

// Errores upstream contra Addi API (auth, validation, gateway).
export class AddiGatewayError extends Error {
  readonly status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "AddiGatewayError";
    this.status = status;
  }
}

// Configuración del entorno faltante (ADDI_API_URL, NEXT_PUBLIC_APP_URL…).
export class AddiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AddiConfigError";
  }
}
