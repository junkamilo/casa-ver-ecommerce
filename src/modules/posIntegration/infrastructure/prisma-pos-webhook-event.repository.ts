import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PosWebhookPayload } from "../contracts/pos-catalog.schema";

export type PosEventStatus = "RECEIVED" | "PROCESSED" | "FAILED";

export class PrismaPosWebhookEventRepository {
  /** Registra el evento; si el eventId ya existía devuelve su estado actual. */
  async register(payload: PosWebhookPayload): Promise<{ isNew: boolean; status: PosEventStatus }> {
    const occurredAt = payload.occurredAt ? new Date(payload.occurredAt) : null;
    try {
      await prisma.posWebhookEvent.create({
        data: {
          eventId: payload.eventId,
          event: payload.event,
          entityType: payload.entityType,
          entityId: payload.id,
          action: payload.action,
          occurredAt: occurredAt && !Number.isNaN(occurredAt.getTime()) ? occurredAt : null,
        },
      });
      return { isNew: true, status: "RECEIVED" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const existing = await prisma.posWebhookEvent.findUnique({
          where: { eventId: payload.eventId },
          select: { status: true },
        });
        return { isNew: false, status: (existing?.status ?? "RECEIVED") as PosEventStatus };
      }
      throw error;
    }
  }

  async markProcessed(eventId: string): Promise<void> {
    await prisma.posWebhookEvent.update({
      where: { eventId },
      data: { status: "PROCESSED", processedAt: new Date(), errorMessage: null, attempts: { increment: 1 } },
    });
  }

  async markFailed(eventId: string, errorMessage: string): Promise<void> {
    await prisma.posWebhookEvent.update({
      where: { eventId },
      data: { status: "FAILED", errorMessage: errorMessage.slice(0, 1000), attempts: { increment: 1 } },
    });
  }

  async log(input: {
    eventType: string;
    payload: Prisma.InputJsonValue;
    signature: string | null;
    status: number;
    errorMessage?: string | null;
  }): Promise<void> {
    await prisma.webhookLog.create({
      data: {
        provider: "POS",
        eventType: input.eventType,
        payload: input.payload,
        signature: input.signature,
        status: input.status,
        errorMessage: input.errorMessage ?? null,
      },
    });
  }
}
