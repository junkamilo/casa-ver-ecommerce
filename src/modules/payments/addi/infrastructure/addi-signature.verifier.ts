import { createHmac, timingSafeEqual } from "crypto";

// ---------------------------------------------------------------------------
// Addi Webhook — Validación de firma con ADDI_WEBHOOK_SECRET.
// Addi envía la firma en: "x-addi-signature" o "x-signature".
// HMAC-SHA256 sobre rawBody, codificado en base64 y comparado timing-safe.
// ---------------------------------------------------------------------------
export function verifyAddiSignature(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.ADDI_WEBHOOK_SECRET;
  const isProd = process.env.NODE_ENV === "production";

  if (!secret) {
    if (isProd) {
      console.error(
        "[Addi Webhook] ✗ PROD: ADDI_WEBHOOK_SECRET no configurado — rechazando webhook"
      );
      return false;
    }
    console.warn(
      "[Addi Webhook] ADDI_WEBHOOK_SECRET no configurado — omitiendo validación de firma"
    );
    return true;
  }

  if (!signatureHeader) {
    if (isProd) {
      console.error("[Addi Webhook] ✗ PROD: Header de firma ausente — rechazando webhook");
      return false;
    }
    return true;
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("base64");

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}
