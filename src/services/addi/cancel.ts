import { getAddiToken } from "./auth";

// ---------------------------------------------------------------------------
// Addi — Cancelación total de crédito aprobado
// Docs: POST /v1/online-applications/cancellations
//
// Llámalo cuando el admin cancela o reembolsa una orden pagada con Addi.
// Addi acepta solo cancelación TOTAL (el monto debe coincidir con el total aprobado).
// ---------------------------------------------------------------------------

export interface AddiCancelResult {
  success: boolean;
  error?: string;
}

export async function cancelAddiApplication(
  externalOrderId: string, // transactionId de la orden (UUID que se envió a Addi como orderId)
  amount: number            // monto total de la orden en COP (entero, sin decimales)
): Promise<AddiCancelResult> {
  const apiUrl = process.env.ADDI_API_URL;
  if (!apiUrl) {
    return { success: false, error: "ADDI_API_URL no configurado" };
  }

  let token: string;
  try {
    token = await getAddiToken();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error obteniendo token Addi";
    console.error("[Addi Cancel] Error de autenticación:", err);
    return { success: false, error: msg };
  }

  const payload = {
    orderId: externalOrderId,
    amount: String(Math.round(amount)),
  };

  console.log("[Addi Cancel] Cancelando crédito:", payload);

  const res = await fetch(`${apiUrl}/v1/online-applications/cancellations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.ok || res.status === 204) {
    console.info("[Addi Cancel] Crédito cancelado correctamente:", externalOrderId);
    return { success: true };
  }

  let errorDetail = "";
  try {
    const data = await res.json();
    errorDetail = data?.message ?? JSON.stringify(data);
  } catch {
    errorDetail = await res.text();
  }

  console.error(`[Addi Cancel] Error ${res.status}:`, errorDetail);
  return { success: false, error: `Addi ${res.status}: ${errorDetail}` };
}
