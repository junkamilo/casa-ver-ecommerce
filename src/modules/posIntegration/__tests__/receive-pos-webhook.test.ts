/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/lib/prisma", () => ({ prisma: {} }));
jest.mock("../application/process-pos-event.use-case", () => ({ processPosEvent: jest.fn() }));

import { receivePosWebhook, type PosWebhookDeps } from "../application/receive-pos-webhook.use-case";
import { signPosPayload } from "../domain/verify-signature";

const SECRET = "whsec-test";
const NOW = 1_790_000_000;

const payload = {
  eventId: "evt-123",
  event: "product.upserted",
  entityType: "product",
  id: "blusa-lino",
  action: "upserted",
  occurredAt: "2026-09-29T10:00:00Z",
};

function makeDeps(registerStatus: { isNew: boolean; status: string } = { isNew: true, status: "RECEIVED" }) {
  const events = {
    register: jest.fn().mockResolvedValue(registerStatus),
    markProcessed: jest.fn().mockResolvedValue(undefined),
    markFailed: jest.fn().mockResolvedValue(undefined),
    log: jest.fn().mockResolvedValue(undefined),
  };
  const process = jest.fn().mockResolvedValue({ ok: true });
  const deps = { events, process, secret: SECRET, nowSeconds: () => NOW } as unknown as PosWebhookDeps;
  return { deps, events, process };
}

function request(body: unknown = payload, overrides: Partial<Record<string, string | null>> = {}) {
  const rawBody = typeof body === "string" ? body : JSON.stringify(body);
  const timestamp = String(NOW);
  return {
    rawBody,
    headers: {
      timestamp,
      signature: `sha256=${signPosPayload(SECRET, timestamp, rawBody)}`,
      eventId: payload.eventId,
      event: payload.event,
      ...overrides,
    },
  };
}

describe("receivePosWebhook", () => {
  it("registra un evento nuevo, responde 200 y procesa en segundo plano", async () => {
    const { deps, events, process } = makeDeps();
    const result = await receivePosWebhook(request(), deps);

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ received: true });
    expect(events.register).toHaveBeenCalledWith(expect.objectContaining({ eventId: "evt-123" }));
    expect(process).not.toHaveBeenCalled();

    await result.background?.();
    expect(process).toHaveBeenCalledWith(expect.objectContaining({ entityType: "product", id: "blusa-lino" }));
    expect(events.markProcessed).toHaveBeenCalledWith("evt-123");
    expect(events.log).toHaveBeenCalledWith(expect.objectContaining({ status: 200 }));
  });

  it("responde 200 sin reprocesar un evento ya procesado", async () => {
    const { deps, process } = makeDeps({ isNew: false, status: "PROCESSED" });
    const result = await receivePosWebhook(request(), deps);

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ received: true, duplicate: true });
    expect(result.background).toBeUndefined();
    expect(process).not.toHaveBeenCalled();
  });

  it("reprocesa un evento que había fallado", async () => {
    const { deps, process } = makeDeps({ isNew: false, status: "FAILED" });
    const result = await receivePosWebhook(request(), deps);

    expect(result.status).toBe(200);
    await result.background?.();
    expect(process).toHaveBeenCalledTimes(1);
  });

  it("marca el evento como fallido si el procesamiento lanza", async () => {
    const { deps, events, process } = makeDeps();
    process.mockRejectedValueOnce(new Error("POS caído"));
    jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await receivePosWebhook(request(), deps);
    await result.background?.();

    expect(events.markFailed).toHaveBeenCalledWith("evt-123", "POS caído");
    expect(events.log).toHaveBeenCalledWith(expect.objectContaining({ status: 500, errorMessage: "POS caído" }));
    expect(events.markProcessed).not.toHaveBeenCalled();
  });

  it("rechaza con 401 una firma inválida sin registrar el evento", async () => {
    const { deps, events } = makeDeps();
    const result = await receivePosWebhook(request(payload, { signature: "sha256=deadbeef" }), deps);

    expect(result.status).toBe(401);
    expect(events.register).not.toHaveBeenCalled();
    await result.background?.();
    expect(events.log).toHaveBeenCalledWith(expect.objectContaining({ status: 401, errorMessage: "bad_signature" }));
  });

  it("responde 503 si falta el secreto", async () => {
    const { deps } = makeDeps();
    jest.spyOn(console, "error").mockImplementation(() => {});
    const result = await receivePosWebhook(request(), { ...deps, secret: undefined });
    expect(result.status).toBe(503);
  });

  it("responde 400 con JSON inválido o payload incompleto", async () => {
    const { deps } = makeDeps();
    expect((await receivePosWebhook(request("{no-json"), deps)).status).toBe(400);
    expect((await receivePosWebhook(request({ ...payload, action: "otra" }), deps)).status).toBe(400);
  });

  it("responde 400 si el eventId del encabezado no coincide con el cuerpo", async () => {
    const { deps, events } = makeDeps();
    const result = await receivePosWebhook(request(payload, { eventId: "evt-otro" }), deps);
    expect(result.status).toBe(400);
    expect(events.register).not.toHaveBeenCalled();
  });
});
