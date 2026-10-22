import { prisma } from "@/lib/prisma";
import { cancelAddiApplication } from "@/services/addi/cancel";
import { decideWebStatusFromPos, isCancellationStatus, posStatusFromWeb, type WebOrderStatus } from "../domain/pos-order-status";
import { getPosOrderStatus, isPosCatalogConfigured, postOrderStatus } from "../infrastructure/pos-catalog.client";

export type SyncOrderFromPosResult =
  | { status: "updated"; orderNumber: string; from: string; to: string }
  | { status: "unchanged" | "missing"; orderNumber: string };

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Aviso `order.status_changed` del POS: vuelve a consultar el pedido en el POS y aplica su estado
 * logístico en la web (Procesando, Enviado con guía, Entregado, Cancelado, Reembolsado). No se
 * reporta de vuelta al POS. Cancelar un pedido de Addi cancela también el crédito, como el admin web.
 */
export async function syncOrderStatusFromPos(orderNumber: string): Promise<SyncOrderFromPosResult> {
  const pos = await getPosOrderStatus(orderNumber);
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: { id: true, status: true, paymentMethod: true, transactionId: true, total: true },
  });
  if (!pos || !order) return { status: "missing", orderNumber };

  const target = decideWebStatusFromPos(order.status as WebOrderStatus, pos.fulfillmentStatus);
  const tracking = {
    ...(pos.trackingNumber ? { trackingNumber: pos.trackingNumber } : {}),
    ...(pos.trackingUrl ? { trackingUrl: pos.trackingUrl } : {}),
  };
  if (!target) {
    if (Object.keys(tracking).length > 0 && order.status === "SHIPPED") {
      await prisma.order.update({ where: { id: order.id }, data: tracking });
    }
    return { status: "unchanged", orderNumber };
  }

  const now = new Date();
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: target,
      ...tracking,
      ...(target === "SHIPPED" ? { shippedAt: parseDate(pos.shippedAt) ?? now } : {}),
      ...(target === "DELIVERED" ? { deliveredAt: parseDate(pos.deliveredAt) ?? now } : {}),
      ...(isCancellationStatus(target) ? { cancelledAt: now } : {}),
    },
  });

  if (isCancellationStatus(target) && order.paymentMethod === "ADDI" && order.transactionId) {
    const cancel = await cancelAddiApplication(order.transactionId, Number(order.total));
    if (!cancel.success) {
      console.error(`[POS pedidos] No se pudo cancelar el crédito Addi de ${orderNumber}:`, cancel.error);
    }
  }
  return { status: "updated", orderNumber, from: order.status, to: target };
}

export type ReportOrderStatusResult =
  | { status: "reported"; fulfillmentStatus: string | null }
  | { status: "skipped"; reason: string };

/**
 * Reporta al POS un cambio de estado hecho en la web: Procesando, Enviado (con guía) o Entregado
 * (también cuando el cliente confirma la entrega). Las cancelaciones van por reportOrderCancellationToPos.
 * Idempotente en el POS: un estado igual o anterior no cambia nada. Lanza si el POS no responde.
 */
export async function reportOrderStatusToPos(
  ref: { id?: string; orderNumber?: string },
  options: { confirmedByCustomer?: boolean } = {},
): Promise<ReportOrderStatusResult> {
  if (!isPosCatalogConfigured()) return { status: "skipped", reason: "POS no configurado" };
  const order = await prisma.order.findFirst({
    where: ref.id ? { id: ref.id } : { orderNumber: ref.orderNumber },
    select: { orderNumber: true, status: true, trackingNumber: true, trackingUrl: true, shippedAt: true, deliveredAt: true },
  });
  if (!order) return { status: "skipped", reason: "pedido inexistente" };
  const status = posStatusFromWeb(order.status);
  if (!status) return { status: "skipped", reason: `estado ${order.status} no se reporta` };

  const changedAt = status === "DELIVERED" ? order.deliveredAt : status === "SHIPPED" ? order.shippedAt : null;
  const result = await postOrderStatus(order.orderNumber, {
    status,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    confirmedByCustomer: options.confirmedByCustomer ?? false,
    note: options.confirmedByCustomer ? "Entrega confirmada por el cliente" : null,
    changedAt: changedAt ? changedAt.toISOString() : null,
  });
  if (!result) return { status: "skipped", reason: "el pedido no está en el POS" };
  return { status: "reported", fulfillmentStatus: result.fulfillmentStatus };
}

/** Para el cron: reporta sin lanzar (los pedidos sin productos del POS se omiten). */
export async function reportOrderStatusQuietly(
  ref: { id?: string; orderNumber?: string },
  options: { confirmedByCustomer?: boolean } = {},
): Promise<void> {
  try {
    await reportOrderStatusToPos(ref, options);
  } catch (error) {
    console.warn(
      `[POS pedidos] Estado de ${ref.orderNumber ?? ref.id} quedará para el reintento:`,
      error instanceof Error ? error.message : error,
    );
  }
}
