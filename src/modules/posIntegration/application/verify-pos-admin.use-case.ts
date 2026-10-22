import { isPosCatalogConfigured } from "../infrastructure/pos-config";
import { PosApiError, verifyWebAdmin } from "../infrastructure/pos-catalog.client";

export type PosAdminLoginOutcome = "valid" | "invalid" | "too_many_attempts" | "unavailable";

/**
 * Login de un admin gestionado por el POS: el POS verifica la contraseña (la misma con la que entra al
 * POS) y que siga siendo admin de la web y esté activo. Si el POS no responde no hay respaldo con la
 * contraseña local: podría ser una contraseña ya cambiada o un acceso ya retirado.
 */
export async function verifyPosAdminPassword(
  email: string,
  password: string,
  clientIp: string | null,
): Promise<PosAdminLoginOutcome> {
  if (!isPosCatalogConfigured()) return "unavailable";
  try {
    const result = await verifyWebAdmin(email, password, clientIp);
    return result.valid ? "valid" : "invalid";
  } catch (error) {
    if (error instanceof PosApiError && error.status === 429) return "too_many_attempts";
    console.error("[POS admins] no se pudo verificar el acceso:", error instanceof Error ? error.message : error);
    return "unavailable";
  }
}
