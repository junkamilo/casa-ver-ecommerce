import { timingSafeEqual } from "crypto";

// Valida que la request del callback de Addi incluya la clave secreta
// correcta en el query param ?key=. En producción rechaza si la clave no
// está configurada o no coincide. En desarrollo omite la validación para
// facilitar pruebas locales.
export function verifyAddiCallbackKey(providedKey: string | null): boolean {
  const secret = process.env.ADDI_CALLBACK_SECRET ?? "";
  const isProd = process.env.NODE_ENV === "production";

  if (!secret) {
    if (isProd) {
      console.error(
        "[Addi Callback] ADDI_CALLBACK_SECRET no configurado en producción — rechazando"
      );
      return false;
    }
    console.warn(
      "[Addi Callback] ADDI_CALLBACK_SECRET no configurado — omitiendo validación (solo dev)"
    );
    return true;
  }

  if (!providedKey) {
    console.warn("[Addi Callback] Clave de acceso ausente en la URL del callback");
    return false;
  }

  try {
    // timingSafeEqual previene timing attacks al comparar la clave
    return timingSafeEqual(Buffer.from(secret, "utf8"), Buffer.from(providedKey, "utf8"));
  } catch {
    // timingSafeEqual lanza si los buffers tienen longitudes distintas
    return false;
  }
}
