import { createHmac, timingSafeEqual } from "crypto";

export const POS_SIGNATURE_TOLERANCE_SECONDS = 300;

export type PosSignatureCheck =
  | { valid: true }
  | { valid: false; reason: "missing_secret" | "missing_headers" | "stale_timestamp" | "bad_signature" };

export function signPosPayload(secret: string, timestamp: number | string, rawBody: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${rawBody}`, "utf8").digest("hex");
}

/**
 * Verifica `X-CasaVerde-Signature: sha256=<hex(HMAC-SHA256(secret, timestamp + "." + cuerpoCrudo))>`
 * en tiempo constante, rechazando timestamps fuera de la ventana de 5 minutos.
 */
export function verifyPosSignature(input: {
  rawBody: string;
  timestamp: string | null;
  signature: string | null;
  secret: string | undefined;
  nowSeconds?: number;
}): PosSignatureCheck {
  if (!input.secret) return { valid: false, reason: "missing_secret" };
  if (!input.timestamp || !input.signature) return { valid: false, reason: "missing_headers" };

  const ts = Number(input.timestamp);
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (!Number.isInteger(ts) || Math.abs(now - ts) > POS_SIGNATURE_TOLERANCE_SECONDS) {
    return { valid: false, reason: "stale_timestamp" };
  }

  const expected = Buffer.from(signPosPayload(input.secret, input.timestamp, input.rawBody), "utf8");
  const received = Buffer.from(input.signature.trim().replace(/^sha256=/i, "").toLowerCase(), "utf8");

  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return { valid: false, reason: "bad_signature" };
  }
  return { valid: true };
}
