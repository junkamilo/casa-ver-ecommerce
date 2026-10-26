import { prisma } from "@/lib/prisma";
import { cancelAddiApplication } from "@/services/addi/cancel";
import { decideWebStatusFromPos, type WebOrderStatus } from "../domain/pos-order-status";
import { getPosOrderStatus } from "../infrastructure/pos-catalog.client";

export type SyncOrderFromPosResult =
  | { status: "updated"; orderNumber: string; from: string; to: string }
  | { status: "unchanged" | "missing"; orderNumber: string };

/**
 * Aviso `order.status_changed` del POS. La logística (Procesando, Enviado con guía, Entregado) no se copia:
 * «Mis pedidos» y el panel la leen del POS. Solo una anulación cambia la web: el pedido pagado queda
 * cancelado o reembolsado y, si se pagó con Addi, se cancela el crédito.
 */
export async function syncOrderStatusFromPos(orderNumber: string): Promise<SyncOrderFromPosResult> {
  const pos = await getPosOrderStatus(orderNumber);
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: { id: true, status: true, paymentMethod: true, transactionId: true, total: true },
  });
  if (!pos || !order) return { status: "missing", orderNumber };

  const target = decideWebStatusFromPos(order.status as WebOrderStatus, pos.fulfillmentStatus);
  if (!target) return { status: "unchanged", orderNumber };

  await prisma.order.update({ where: { id: order.id }, data: { status: target, cancelledAt: new Date() } });

  if (order.paymentMethod === "ADDI" && order.transactionId) {
    const cancel = await cancelAddiApplication(order.transactionId, Number(order.total));
    if (!cancel.success) {
      console.error(`[POS pedidos] No se pudo cancelar el crédito Addi de ${orderNumber}:`, cancel.error);
    }
  }
  return { status: "updated", orderNumber, from: order.status, to: target };
}
