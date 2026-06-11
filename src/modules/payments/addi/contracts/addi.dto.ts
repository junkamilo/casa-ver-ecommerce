// Contratos del módulo Addi.

export interface CreateAddiApplicationInputDTO {
  orderId: string;
  cedula: string;
  sessionUserId?: string;
}

export interface CreateAddiApplicationResultDTO {
  redirectUrl: string;
}

export type AddiCallbackStatus =
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "ABANDONED"
  | "DECLINED"
  | "INTERNAL_ERROR";

export interface AddiCallbackInputDTO {
  payload: Record<string, unknown>;
  providedKey: string | null;
}

export interface AddiCallbackResultDTO {
  // Siempre 200 (Addi reintenta si no recibe 200, salvo errores internos
  // intencionales). Si quisiéramos forzar reintento se lanza el error.
  received: true;
}

export interface AddiCancelInputDTO {
  orderId: string;
}

export interface AddiCancelResultDTO {
  cancelled: true;
}

export interface AddiWebhookInputDTO {
  rawBody: string;
  payload: Record<string, unknown>;
  signatureHeader: string;
}

export interface AddiCancelLowLevelResult {
  success: boolean;
  error?: string;
}
