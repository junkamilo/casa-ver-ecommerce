import { NextResponse } from "next/server";
import {
  listRecentCancelledPaidOrderIds,
  listRecentPaidOrderIds,
  reportOrderCancellationToPos,
  reportPaidOrderToPos,
} from "@/modules/posIntegration/application/report-order-to-pos.use-case";
import { isPosCatalogConfigured } from "@/modules/posIntegration/infrastructure/pos-catalog.client";

export const maxDuration = 300;

/** Pedidos pagados de los últimos días que se reenvían (el POS ignora los ya registrados). */
const LOOKBACK_DAYS = 7;

function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Reintenta reportar al POS los pedidos pagados que no llegaron cuando se confirmó el pago, y las
 * cancelaciones o reembolsos de pedidos pagados. Ambas operaciones son idempotentes en el POS. La logística
 * (Procesando, Enviado, Entregado) se maneja solo en el POS: la web no tiene estados que reportarle.
 */
export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isPosCatalogConfigured()) {
    return NextResponse.json({ error: "Integración POS no configurada" }, { status: 503 });
  }

  const summary = { registered: 0, replayed: 0, skipped: 0, rejected: 0, failed: 0 };
  const errors: string[] = [];
  for (const orderId of await listRecentPaidOrderIds(LOOKBACK_DAYS)) {
    try {
      const result = await reportPaidOrderToPos(orderId);
      if (result.status === "registered") {
        if (result.replay) summary.replayed++;
        else summary.registered++;
      } else if (result.status === "rejected") {
        summary.rejected++;
      } else {
        summary.skipped++;
      }
    } catch (error) {
      summary.failed++;
      errors.push(`${orderId}: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Anulaciones y reembolsos de pedidos pagados que no llegaron al POS en su momento.
  const cancellations = { cancelled: 0, replayed: 0, skipped: 0, failed: 0 };
  for (const orderId of await listRecentCancelledPaidOrderIds(LOOKBACK_DAYS)) {
    try {
      const result = await reportOrderCancellationToPos({ id: orderId });
      if (result.status === "cancelled") {
        if (result.replay) cancellations.replayed++;
        else cancellations.cancelled++;
      } else {
        cancellations.skipped++;
      }
    } catch (error) {
      cancellations.failed++;
      errors.push(`anulación ${orderId}: ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log("[Cron/PosOrders]", JSON.stringify({ ...summary, cancellations }));
  if (errors.length > 0) console.warn("[Cron/PosOrders] Errores:", errors);
  return NextResponse.json({ ...summary, cancellations, errors });
}
