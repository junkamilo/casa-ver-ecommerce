// Predicados puros de los estados de Bold. No dependen de infra y son
// extraídos byte-a-byte del webhook actual para preservar comportamiento.
//
// Estados Bold (Payment Intent API — GET /v1/payment/{reference_id}):
//   RUNNING     → Pago en proceso (3DS pendiente, etc.)
//   APPROVED    → Pago exitoso ✅
//   REJECTED    → Pago rechazado
//   CANCELLED   → Cancelado por usuario
//
// Eventos Bold (webhook — Payment Intent API):
//   SALE_APPROVED   → pago exitoso ✅
//   SALE_REJECTED   → pago rechazado
//   VOID_APPROVED   → anulación aprobada (mismo día)
//   VOID_REJECTED   → anulación rechazada

export function isApproved(eventType?: string, boldStatus?: string): boolean {
  return (
    eventType === "SALE_APPROVED" ||
    eventType === "PAYMENT_APPROVED" ||
    eventType === "TRANSACTION_APPROVED" ||
    eventType === "payment.approved" ||
    boldStatus === "APPROVED" ||
    boldStatus === "approved" ||
    boldStatus === "PAID"
  );
}

export function isRejected(eventType?: string, boldStatus?: string): boolean {
  return (
    eventType === "SALE_REJECTED" ||
    eventType === "PAYMENT_REJECTED" ||
    eventType === "payment.rejected" ||
    boldStatus === "REJECTED" ||
    boldStatus === "rejected"
  );
}

export function isRefunded(eventType?: string, boldStatus?: string): boolean {
  return (
    eventType === "VOID_APPROVED" ||
    boldStatus === "REFUNDED" ||
    boldStatus === "refunded"
  );
}

// Extrae el status de la respuesta GET /online/link/v1/{LNK_*}
export function extractBoldLinkStatus(data: Record<string, unknown>): string {
  const payload = data.payload as Record<string, unknown> | undefined;
  const raw = (data.status ?? payload?.status ?? "UNKNOWN") as string;
  return raw.toUpperCase();
}

// Mapea un boldStatus crudo (PAID, REJECTED, EXPIRED…) al status de UI
// que la página /pago/resultado espera.
export function mapBoldStatusToUiStatus(boldStatus: string): string {
  return boldStatus === "PAID" ? "APPROVED" : boldStatus;
}

// Estados terminales por los que /api/payments/bold/verify debe marcar la
// orden en BD como FAILED (cuando aún sigue PENDING).
export function shouldMarkAsFailed(boldStatus: string): boolean {
  return (
    boldStatus === "REJECTED" ||
    boldStatus === "CANCELLED" ||
    boldStatus === "EXPIRED"
  );
}
