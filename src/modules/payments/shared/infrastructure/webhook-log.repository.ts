import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type WebhookProvider = "BOLD" | "ADDI";

export interface CreateWebhookLogInput {
  orderId: string | null;
  provider: WebhookProvider;
  eventType: string | null;
  payload: Prisma.InputJsonValue;
  signature: string;
  status: number;
  attempt?: number;
  errorMessage?: string | null;
}

export interface UpdateWebhookLogInput {
  id: string;
  status: number;
  errorMessage?: string | null;
}

// Repositorio compartido entre Bold y Addi para registrar y deduplicar
// eventos en la tabla `webhook_logs`. Centraliza el patrón actual que
// estaba duplicado en 4 archivos (bold/route, bold/verify, webhooks/addi,
// addi/callback).
export class WebhookLogRepository {
  async create(input: CreateWebhookLogInput): Promise<{ id: string }> {
    return prisma.webhookLog.create({
      data: {
        orderId: input.orderId,
        provider: input.provider,
        eventType: input.eventType,
        payload: input.payload,
        signature: input.signature,
        status: input.status,
        attempt: input.attempt ?? 1,
        errorMessage: input.errorMessage ?? null,
      },
      select: { id: true },
    });
  }

  async update(input: UpdateWebhookLogInput): Promise<void> {
    await prisma.webhookLog.update({
      where: { id: input.id },
      data: {
        status: input.status,
        errorMessage: input.errorMessage ?? null,
      },
    });
  }

  // Encuentra un log existente para una orden y un eventType específicos.
  // Se usa para deduplicar callbacks Addi cuando el mismo estado se recibe
  // varias veces en paralelo (callback + webhook).
  async findExistingByOrderAndEvent(
    orderId: string,
    eventType: string
  ): Promise<{ id: string } | null> {
    return prisma.webhookLog.findFirst({
      where: { orderId, eventType },
      select: { id: true },
    });
  }
}
