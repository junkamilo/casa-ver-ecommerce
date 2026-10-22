import type { PosFulfillmentStatus } from "../contracts/pos-catalog.schema";

/**
 * Sincronización del estado logístico de los pedidos entre el POS (Tienda → Pedidos) y la web, con
 * las mismas transiciones del admin web: el flujo va hacia adelante y CANCELLED / REFUNDED son finales.
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

/** Estados de la web que el POS no puede mover: sin pagar, fallidos o ya finales. */
const LOCKED: ReadonlySet<WebOrderStatus> = new Set(["PENDING", "FAILED", "CANCELLED", "REFUNDED"]);

const RANK: Record<string, number> = { PAID: 0, PROCESSING: 1, SHIPPED: 2, DELIVERED: 3 };

export function isCancellationStatus(status: string): status is "CANCELLED" | "REFUNDED" {
  return status === "CANCELLED" || status === "REFUNDED";
}

/**
 * Estado al que debe pasar el pedido de la web según el POS, o `null` si no hay que cambiar nada
 * (mismo estado, aviso viejo que retrocedería o pedido de la web bloqueado).
 */
export function decideWebStatusFromPos(
  web: WebOrderStatus,
  pos: PosFulfillmentStatus | null,
): Exclude<WebOrderStatus, "PENDING" | "FAILED" | "PAID"> | null {
  if (!pos || pos === "PAID" || LOCKED.has(web)) return null;
  if (isCancellationStatus(pos)) return pos;
  // PROCESSING en la web también puede ser «validando el pago»: solo se avanza un pedido ya pagado
  // (el POS solo conoce pedidos pagados, así que su PROCESSING siempre es logístico).
  return (RANK[pos] ?? -1) > (RANK[web] ?? -1) ? pos : null;
}

/** Estado de la web que se reporta al POS; `null` si no aplica (pago, fallidos o cancelaciones). */
export function posStatusFromWeb(web: string): "PROCESSING" | "SHIPPED" | "DELIVERED" | null {
  return web === "PROCESSING" || web === "SHIPPED" || web === "DELIVERED" ? web : null;
}
