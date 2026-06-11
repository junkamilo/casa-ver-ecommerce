// Predicados puros del dominio Addi.
//
// Mapas extraídos byte-a-byte del callback y webhook originales.

export type AddiOrderResolvedStatus = "FAILED" | "CANCELLED";

// Para callbacks: status es un enum normalizado a UPPERCASE. Mapea a:
//   REJECTED       → FAILED
//   DECLINED       → FAILED
//   INTERNAL_ERROR → FAILED
//   ABANDONED      → CANCELLED
//   APPROVED       → no aplica (se procesa con markOrderPaid)
//   PENDING        → no aplica (Addi sigue procesando)
const CALLBACK_STATUS_MAP: Record<string, AddiOrderResolvedStatus> = {
  REJECTED: "FAILED",
  DECLINED: "FAILED",
  INTERNAL_ERROR: "FAILED",
  ABANDONED: "CANCELLED",
};

export function mapCallbackStatusToOrderStatus(
  normalizedStatus: string
): AddiOrderResolvedStatus | null {
  return CALLBACK_STATUS_MAP[normalizedStatus] ?? null;
}

// Para el webhook (que tiene formato más laxo).
export function isWebhookApproved(eventType?: string, addiStatus?: string): boolean {
  return (
    addiStatus === "APPROVED" ||
    addiStatus === "approved" ||
    eventType === "application.approved"
  );
}

export function isWebhookRejected(eventType?: string, addiStatus?: string): boolean {
  return (
    addiStatus === "REJECTED" ||
    addiStatus === "rejected" ||
    addiStatus === "DECLINED" ||
    addiStatus === "declined" ||
    eventType === "application.rejected" ||
    eventType === "application.declined"
  );
}
