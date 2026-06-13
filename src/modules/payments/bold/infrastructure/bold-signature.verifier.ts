import { createHmac, timingSafeEqual } from "crypto";

// ---------------------------------------------------------------------------
// Verificación HMAC-SHA256 — timing-safe
//
// DOCUMENTACIÓN OFICIAL BOLD (developers.bold.co/webhook):
//   1. Convertir el rawBody a Base64
//   2. Calcular HMAC-SHA256 sobre ese Base64 usando la llave secreta
//   3. Comparar en hex con x-bold-signature
//
// Fallback: algunos entornos/SDK calculan HMAC sobre el raw body directamente.
//
// BOLD_WEBHOOK_SECRET = Dashboard Bold → Integraciones → Llave secreta
//   (NO es la URL del webhook ni la identity key)
// ---------------------------------------------------------------------------

export type BoldSignatureResult =
  | { skip: true }
  | { skip: false; valid: boolean; method?: "base64" | "raw" };

function isValidSecret(secret: string): boolean {
  return secret.length > 0 && !secret.startsWith("http");
}

function normalizeSignatureHeader(header: string): string {
  const trimmed = header.trim();
  return trimmed.startsWith("sha256=") ? trimmed.slice(7) : trimmed;
}

function computeExpectedSignatures(rawBody: string, secret: string) {
  const bodyBase64 = Buffer.from(rawBody, "utf8").toString("base64");
  const base64 = createHmac("sha256", secret).update(bodyBase64).digest("hex");
  const raw = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  return { base64, raw };
}

function timingSafeHexEqual(expected: string, received: string): boolean {
  try {
    const expectedBuf = Buffer.from(expected, "hex");
    const receivedBuf = Buffer.from(received, "hex");
    if (expectedBuf.length !== receivedBuf.length) return false;
    return timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
}

export function verifyBoldSignature(
  rawBody: string,
  signatureHeader: string
): BoldSignatureResult {
  const secret = (process.env.BOLD_WEBHOOK_SECRET ?? "").trim();
  const isProd = process.env.NODE_ENV === "production";
  const received = normalizeSignatureHeader(signatureHeader);

  if (!received) {
    if (isProd && isValidSecret(secret)) {
      console.error("[Bold] ✗ PROD: Header 'x-bold-signature' ausente — rechazando webhook");
      return { skip: false, valid: false };
    }
    console.warn("[Bold] ⚠ Header 'x-bold-signature' ausente — aceptando sin verificar firma");
    return { skip: true };
  }

  if (!isValidSecret(secret)) {
    if (isProd) {
      console.error(
        "[Bold] ✗ PROD: BOLD_WEBHOOK_SECRET no configurado — rechazando webhook por seguridad"
      );
      console.error(
        "[Bold]   Configura BOLD_WEBHOOK_SECRET en Vercel (Dashboard Bold → Integraciones → Llave secreta)"
      );
      return { skip: false, valid: false };
    }
    console.warn("[Bold] ⚠ BOLD_WEBHOOK_SECRET no configurado correctamente (¿es una URL?)");
    return { skip: true };
  }

  const { base64, raw } = computeExpectedSignatures(rawBody, secret);

  if (timingSafeHexEqual(base64, received)) {
    return { skip: false, valid: true, method: "base64" };
  }
  if (timingSafeHexEqual(raw, received)) {
    console.warn("[Bold] ⚠ Firma válida con algoritmo raw-body (fallback)");
    return { skip: false, valid: true, method: "raw" };
  }

  if (isProd) {
    console.warn(
      "[Bold] ✗ Firma HMAC inválida",
      `(recibida: ${received.slice(0, 12)}…, base64: ${base64.slice(0, 12)}…)`
    );
  }

  return { skip: false, valid: false };
}
