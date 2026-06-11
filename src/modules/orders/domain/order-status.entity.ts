// Estados de orden que aún no son terminales: una orden en estos estados
// puede transicionar a PAID, FAILED, CANCELLED o REFUNDED. Si la orden ya
// pasó por aquí, releaseOrderStock no debe actuar (idempotencia).
export const TRANSITIONAL_ORDER_STATUSES = ["PENDING", "PROCESSING"] as const;

export type TransitionalOrderStatus = (typeof TRANSITIONAL_ORDER_STATUSES)[number];

export type ReleaseOrderStockTargetStatus = "FAILED" | "REFUNDED" | "CANCELLED";

export function isTransitionalStatus(status: string): status is TransitionalOrderStatus {
  return (TRANSITIONAL_ORDER_STATUSES as readonly string[]).includes(status);
}

export function isPaidStatus(status: string): boolean {
  return status === "PAID";
}
