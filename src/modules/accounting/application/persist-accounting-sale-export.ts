import * as Sentry from "@sentry/nextjs";
import { buildAccountingSalePayload } from "./build-accounting-sale-payload";
import {
  PrismaAccountingSaleRepository,
  type AccountingWebhookStatus,
} from "../infrastructure/prisma-accounting-sale.repository";
import type { AccountingSalePayloadDTO } from "../contracts/accounting-sale.dto";

const repository = new PrismaAccountingSaleRepository();

/** Token compartido con contabilidad (header X-Webhook-Token). */
function resolveWebhookToken(): string | undefined {
  return (
    process.env.ACCOUNTING_WEBHOOK_TOKEN?.trim() ||
    process.env.ACCOUNTING_WEBHOOK_SECRET?.trim() ||
    undefined
  );
}

async function maybeSendWebhook(
  payload: AccountingSalePayloadDTO,
): Promise<{
  status: AccountingWebhookStatus;
  attempts: number;
  sentAt: Date | null;
  error: string | null;
}> {
  const url = process.env.ACCOUNTING_WEBHOOK_URL?.trim();
  if (!url) {
    return { status: "SKIPPED", attempts: 0, sentAt: null, error: null };
  }

  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = resolveWebhookToken();
  if (token) {
    headers["X-Webhook-Token"] = token;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        status: "FAILED",
        attempts: 1,
        sentAt: null,
        error: `HTTP ${res.status}: ${text.slice(0, 500)}`,
      };
    }
    return {
      status: "SENT",
      attempts: 1,
      sentAt: new Date(),
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      status: "FAILED",
      attempts: 1,
      sentAt: null,
      error: message.slice(0, 500),
    };
  }
}

/**
 * Best-effort: guarda snapshot contable del pedido y, si hay URL, lo envía por webhook.
 * Body = { order, items } (un pedido). Header: X-Webhook-Token.
 * Nunca lanza: fallos se loguean / Sentry y el PAID no se revierte.
 */
export async function persistAccountingSaleExport(
  orderId: string,
): Promise<void> {
  try {
    const payload = await buildAccountingSalePayload(orderId);
    if (!payload) {
      console.warn(
        `[accounting] No se pudo armar payload para orderId=${orderId}`,
      );
      return;
    }

    const paidAt = payload.order.paidAt
      ? new Date(payload.order.paidAt)
      : new Date(payload.order.createdAt);

    const webhook = await maybeSendWebhook(payload);

    await repository.upsertByOrderId({
      orderId: payload.order.id,
      orderNumber: payload.order.orderNumber,
      paidAt,
      payload,
      webhookStatus: webhook.status,
      webhookAttempts: webhook.attempts,
      webhookSentAt: webhook.sentAt,
      webhookError: webhook.error,
    });
  } catch (err) {
    console.error("[accounting] persistAccountingSaleExport failed:", err);
    Sentry.withScope((scope) => {
      scope.setTag("module", "accounting");
      scope.setExtra("orderId", orderId);
      Sentry.captureException(err);
    });
  }
}

/**
 * Reenvía un snapshot ya guardado (o lo reconstruye) al webhook de contabilidad.
 * Útil para histórico / reintentos cuando contabilidad estuvo caída.
 */
export async function pushAccountingSaleWebhook(
  orderId: string,
): Promise<{ ok: boolean; status: AccountingWebhookStatus; error?: string }> {
  const payload = await buildAccountingSalePayload(orderId);
  if (!payload) {
    return { ok: false, status: "FAILED", error: "payload_unavailable" };
  }

  const paidAt = payload.order.paidAt
    ? new Date(payload.order.paidAt)
    : new Date(payload.order.createdAt);

  const webhook = await maybeSendWebhook(payload);

  await repository.upsertByOrderId({
    orderId: payload.order.id,
    orderNumber: payload.order.orderNumber,
    paidAt,
    payload,
    webhookStatus: webhook.status,
    webhookAttempts: webhook.attempts,
    webhookSentAt: webhook.sentAt,
    webhookError: webhook.error,
  });

  return {
    ok: webhook.status === "SENT" || webhook.status === "SKIPPED",
    status: webhook.status,
    error: webhook.error ?? undefined,
  };
}
