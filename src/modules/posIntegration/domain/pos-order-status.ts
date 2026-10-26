import type { PosFulfillmentStatus } from "../contracts/pos-catalog.schema";

/**
 * La web solo guarda el estado del pago del pedido (PENDING, PAID, FAILED, CANCELLED, REFUNDED); la logística
 * (Procesando, Enviado, Entregado, guía) vive en el POS y se lee de su API. Del POS solo se copia una anulación:
 * un pedido pagado que el POS cancela o reembolsa queda así en la web (y se cancela su crédito Addi).
 */

export type WebOrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED"
  | "REFUNDED";

/** Estados de la web de un pedido pagado (PROCESSING, SHIPPED y DELIVERED solo en pedidos viejos). */
const PAID_WEB: ReadonlySet<string> = new Set(["PAID", "PROCESSING", "SHIPPED", "DELIVERED"]);

export function isCancellationStatus(status: string): status is "CANCELLED" | "REFUNDED" {
  return status === "CANCELLED" || status === "REFUNDED";
}

/**
 * Estado al que pasa el pedido de la web según el POS: solo CANCELLED o REFUNDED de un pedido pagado; `null`
 * en lo demás (los cambios logísticos no se copian, se leen del POS).
 */
export function decideWebStatusFromPos(
  web: WebOrderStatus,
  pos: PosFulfillmentStatus | null,
): "CANCELLED" | "REFUNDED" | null {
  if (!pos || !isCancellationStatus(pos) || !PAID_WEB.has(web)) return null;
  return pos;
}
