// Contratos del módulo Bold — DTOs para entrada y salida de los use cases.

export interface CreateBoldPaymentInputDTO {
  orderId: string;
  sessionUserId?: string;
}

export interface CreateBoldPaymentResultDTO {
  redirectUrl: string;
}

export interface VerifyBoldPaymentInputDTO {
  referenceId: string;
}

export type BoldUiStatus =
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED"
  | "RUNNING"
  | "PROCESSING"
  | "ACTIVE"
  | "UNKNOWN"
  | string;

export interface VerifyBoldPaymentResultDTO {
  status: BoldUiStatus;
  orderId: string;
}

// Snapshot de un transactionId/link de Bold devuelto por la consulta
// "queryByReference" del fallback admin. Compatible con BoldTransactionStatusDTO
// del módulo adminCatalog/boldFallback (alias estructural).
export interface BoldTransactionStatusDTO {
  status?: string;
  boldPaymentId?: string;
  error?: string;
}

// Campos extraídos del payload del webhook Bold para procesamiento async.
export interface BoldWebhookFieldsDTO {
  rawBody: string;
  payload: Record<string, unknown>;
  signatureHeader: string;
  eventType: string | undefined;
  boldPaymentId: string | undefined;
  reference: string | undefined;
  boldStatus: string | undefined;
  amount: number | undefined;
  paymentMethod: string | undefined;
}

export interface BoldPseBankDTO {
  // Estructura laxa porque la respuesta de Bold viene como
  // { id, name } pero podría variar por versión.
  [key: string]: unknown;
}
