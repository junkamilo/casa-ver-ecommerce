import { createHmac, timingSafeEqual } from "crypto";

// ---------------------------------------------------------------------------
// Verificación HMAC-SHA256 — timing-safe
//
// DOCUMENTACIÓN OFICIAL BOLD:
//   1. Convertir el rawBody a Base64
//   2. Calcular HMAC-SHA256 sobre ese Base64 usando el secreto
//   3. Comparar en hex con timing-safe contra x-bold-signature
//
// LÓGICA DE SEGURIDAD:
//   - Si Bold NO envía x-bold-signature → aceptar (Link de Pagos no siempre firma)
//   - Si hay firma PERO el secreto no está configurado → aceptar con warning
//   - Si hay firma Y secreto → verificar HMAC; rechazar solo si NO coincide
//
// BOLD_WEBHOOK_SECRET = llave secreta del Dashboard Bold → Integraciones → Llave secreta
//   (NO es la URL del webhook — es el token hash que Bold genera)
// ---------------------------------------------------------------------------

export type BoldSignatureResult =
  | { skip: true }
  | { skip: false; valid: boolean };

// Retorna true si el secreto parece válido (no vacío, no una URL).
function isValidSecret(secret: string): boolean {
  return secret.length > 0 && !secret.startsWith("http");
}

// Verifica la firma HMAC. Retorna:
//  - { skip: true }  → no hay firma o no hay secreto útil → continuar sin verificar
//  - { skip: false, valid: boolean } → se intentó verificar; usar .valid
export function verifyBoldSignature(
  rawBody: string,
  signatureHeader: string
): BoldSignatureResult {
  const secret = process.env.BOLD_WEBHOOK_SECRET ?? "";
  const isProd = process.env.NODE_ENV === "production";

  // Sin firma → Bold Link de Pagos no siempre incluye x-bold-signature
  if (!signatureHeader) {
    if (isProd && isValidSecret(secret)) {
      console.error("[Bold] ✗ PROD: Header 'x-bold-signature' ausente — rechazando webhook");
      return { skip: false, valid: false };
    }
    console.warn("[Bold] ⚠ Header 'x-bold-signature' ausente — aceptando sin verificar firma");
    return { skip: true };
  }

  // Hay firma pero el secreto no está bien configurado
  if (!isValidSecret(secret)) {
    if (isProd) {
      console.error(
        "[Bold] ✗ PROD: BOLD_WEBHOOK_SECRET no configurado — rechazando webhook por seguridad"
      );
      console.error(
        "[Bold]   Configura BOLD_WEBHOOK_SECRET en las variables de entorno de producción"
      );
      return { skip: false, valid: false };
    }
    console.warn("[Bold] ⚠ BOLD_WEBHOOK_SECRET no configurado correctamente (¿es una URL?)");
    console.warn("[Bold]   Ve a Dashboard Bold → Integraciones → copia la 'Llave secreta'");
    console.warn(
      "[Bold]   Aceptando webhook sin verificar firma hasta que el secreto esté correcto"
    );
    return { skip: true };
  }

  // Hay firma Y secreto válido → verificar HMAC
  const rawSignature = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice(7)
    : signatureHeader;

  // Bold requiere HMAC sobre el body en Base64, NO sobre el raw body directamente
  const bodyBase64 = Buffer.from(rawBody).toString("base64");
  const expected = createHmac("sha256", secret).update(bodyBase64).digest("hex");

  try {
    const expectedBuf = Buffer.from(expected, "hex");
    const receivedBuf = Buffer.from(rawSignature, "hex");
    if (expectedBuf.length !== receivedBuf.length) return { skip: false, valid: false };
    return { skip: false, valid: timingSafeEqual(expectedBuf, receivedBuf) };
  } catch {
    return { skip: false, valid: false };
  }
}
