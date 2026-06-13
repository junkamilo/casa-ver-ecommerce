/**
 * Email Queue — confirmación de pedido se envía de forma síncrona
 * (Resend) para garantizar entrega. QStash queda como respaldo opcional
 * si EMAIL_USE_QSTASH=true.
 */

import { Client } from "@upstash/qstash";
import { sendOrderConfirmationEmail } from "@/services/email/client";
import { prisma } from "@/lib/prisma";
import type { SendOrderConfirmationEmailInput } from "@/services/email/types";

// ── Tipos de jobs ─────────────────────────────────────────────────────────────

export interface OrderConfirmationJob {
  type: "order-confirmation";
  orderId: string;
  payload: SendOrderConfirmationEmailInput;
}

export type EmailJob = OrderConfirmationJob;

// ── Procesador (usado por el consumer /api/queue/email) ───────────────────────

export async function processEmailJob(job: EmailJob): Promise<void> {
  if (job.type === "order-confirmation") {
    // Idempotencia: no reenviar si ya fue enviado exitosamente
    const order = await prisma.order.findUnique({
      where: { id: job.orderId },
      select: { confirmationEmailSentAt: true },
    });
    if (order?.confirmationEmailSentAt) return;

    const result = await sendOrderConfirmationEmail(job.payload);

    await prisma.order.update({
      where: { id: job.orderId },
      data: result.success
        ? { confirmationEmailSentAt: new Date() }
        : {
            confirmationEmailFailedAt: new Date(),
            confirmationEmailError: result.error ?? "Error desconocido",
          },
    });
  }
}

// ── Publisher ─────────────────────────────────────────────────────────────────

function shouldUseQStash() {
  return process.env.EMAIL_USE_QSTASH === "true" && !!process.env.QSTASH_TOKEN;
}

export async function enqueueOrderConfirmationEmail(
  orderId: string,
  payload: SendOrderConfirmationEmailInput
): Promise<void> {
  const job: OrderConfirmationJob = { type: "order-confirmation", orderId, payload };

  // Envío síncrono — crítico para confirmación de compra.
  await processEmailJob(job);

  if (!shouldUseQStash()) return;

  // Respaldo asíncrono vía QStash (idempotente: processEmailJob no reenvía).
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://casaverdeoficial.com";
    const client = new Client({ token: process.env.QSTASH_TOKEN! });
    await client.publishJSON({
      url: `${appUrl}/api/queue/email`,
      body: job,
      retries: 3,
    });
  } catch (err) {
    console.warn(
      "[EmailQueue] QStash backup falló (email ya enviado síncronamente):",
      err instanceof Error ? err.message : err
    );
  }
}
