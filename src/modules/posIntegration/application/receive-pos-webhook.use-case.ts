import type { Prisma } from "@prisma/client";
import { posWebhookPayloadSchema, type PosWebhookPayload } from "../contracts/pos-catalog.schema";
import { verifyPosSignature } from "../domain/verify-signature";
import { PrismaPosWebhookEventRepository } from "../infrastructure/prisma-pos-webhook-event.repository";
import { processPosEvent } from "./process-pos-event.use-case";

export type PosWebhookHeaders = {
  timestamp: string | null;
  signature: string | null;
  eventId: string | null;
  event: string | null;
};

export type PosWebhookDeps = {
  events: Pick<PrismaPosWebhookEventRepository, "register" | "markProcessed" | "markFailed" | "log">;
  process: (payload: PosWebhookPayload) => Promise<unknown>;
  secret: string | undefined;
  nowSeconds?: () => number;
};

export type PosWebhookResult = {
  status: number;
  body: Record<string, unknown>;
  /** Trabajo a ejecutar después de responder (en `after()`). */
  background?: () => Promise<void>;
};

function defaultDeps(): PosWebhookDeps {
  return {
    events: new PrismaPosWebhookEventRepository(),
    process: processPosEvent,
    secret: process.env.POS_WEBHOOK_SECRET,
  };
}

function safeLog(deps: PosWebhookDeps, entry: Parameters<PosWebhookDeps["events"]["log"]>[0]) {
  return deps.events.log(entry).catch((error) => console.error("[POS WEBHOOK] No se pudo registrar el log:", error));
}

/**
 * Valida y registra un aviso del POS. La respuesta debe salir rápido (el POS espera máximo 5 s);
 * la consulta a la API y la escritura en la base de datos quedan en `background`.
 */
export async function receivePosWebhook(
  input: { rawBody: string; headers: PosWebhookHeaders },
  deps: PosWebhookDeps = defaultDeps(),
): Promise<PosWebhookResult> {
  const { rawBody, headers } = input;

  const check = verifyPosSignature({
    rawBody,
    timestamp: headers.timestamp,
    signature: headers.signature,
    secret: deps.secret,
    nowSeconds: deps.nowSeconds?.(),
  });

  if (!check.valid) {
    if (check.reason === "missing_secret") {
      console.error("[POS WEBHOOK] POS_WEBHOOK_SECRET no está configurado");
      return { status: 503, body: { error: "Webhook no configurado" } };
    }
    return {
      status: 401,
      body: { error: "Firma inválida" },
      background: async () => {
        await safeLog(deps, {
          eventType: headers.event ?? "invalid_signature",
          payload: { raw: rawBody.slice(0, 2000), reason: check.reason },
          signature: headers.signature,
          status: 401,
          errorMessage: check.reason,
        });
      },
    };
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return { status: 400, body: { error: "JSON inválido" } };
  }

  const parsed = posWebhookPayloadSchema.safeParse({
    ...(typeof json === "object" && json !== null ? json : {}),
    eventId: (json as { eventId?: string })?.eventId || headers.eventId || undefined,
  });
  if (!parsed.success) {
    return { status: 400, body: { error: parsed.error.issues[0]?.message ?? "Payload inválido" } };
  }

  const payload = parsed.data;
  if (headers.eventId && headers.eventId !== payload.eventId) {
    return { status: 400, body: { error: "X-CasaVerde-Event-Id no coincide con el cuerpo" } };
  }

  const registration = await deps.events.register(payload);
  if (!registration.isNew && registration.status !== "FAILED") {
    return { status: 200, body: { received: true, duplicate: true } };
  }

  return {
    status: 200,
    body: { received: true },
    background: async () => {
      try {
        const result = await deps.process(payload);
        await deps.events.markProcessed(payload.eventId);
        await safeLog(deps, {
          eventType: payload.event,
          payload: { ...payload, result } as unknown as Prisma.InputJsonValue,
          signature: headers.signature,
          status: 200,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[POS WEBHOOK] Error procesando ${payload.event} (${payload.id}):`, error);
        await deps.events
          .markFailed(payload.eventId, message)
          .catch((e) => console.error("[POS WEBHOOK] No se pudo marcar como fallido:", e));
        await safeLog(deps, {
          eventType: payload.event,
          payload: payload as unknown as Prisma.InputJsonValue,
          signature: headers.signature,
          status: 500,
          errorMessage: message,
        });
      }
    },
  };
}
