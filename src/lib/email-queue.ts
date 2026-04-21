/**
 * Email Queue — usa Upstash QStash en producción para desacoplar
 * el envío de emails del ciclo de vida de la request HTTP.
 *
 * Si QSTASH_TOKEN no está configurado (desarrollo), hace el envío
 * de forma síncrona como fallback.
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

function hasQStash() {
  return !!process.env.QSTASH_TOKEN;
}

export async function enqueueOrderConfirmationEmail(
  orderId: string,
  payload: SendOrderConfirmationEmailInput
): Promise<void> {
  const job: OrderConfirmationJob = { type: "order-confirmation", orderId, payload };

  if (!hasQStash()) {
    // Fallback síncrono para desarrollo sin QStash
    await processEmailJob(job);
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://casaverdeoficial.com";
  const client = new Client({ token: process.env.QSTASH_TOKEN! });

  await client.publishJSON({
    url: `${appUrl}/api/queue/email`,
    body: job,
    retries: 3,
  });
}
