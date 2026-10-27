import { isPosCatalogConfigured } from "../infrastructure/pos-config";
import { listWebAdmins, PosApiError, verifyWebAdmin } from "../infrastructure/pos-catalog.client";
import type { PosWebAdmin } from "../contracts/pos-admin.schema";

/**
 * Administradores de la web 100 % del POS (md/COMPARACION-TABLAS-ADMINS-Y-USUARIOS-POS-vs-WEB.md): el POS los
 * crea, les da o quita el acceso web y custodia su contraseña (Configuraciones → Usuarios). La web no guarda
 * administradores: el login los verifica en el POS y la sesión lleva el id del POS.
 */

export type PosAdminLoginOutcome = "valid" | "invalid" | "too_many_attempts" | "unavailable";

export type PosAdminLogin =
  | { outcome: "valid"; admin: PosWebAdmin }
  | { outcome: Exclude<PosAdminLoginOutcome, "valid">; admin: null };

/** Lista de admins del POS en memoria: el aviso `admin.upserted` la limpia; si no, dura un minuto. */
const ADMINS_TTL_MS = 60 * 1000;
let adminsCache: { at: number; emails: Set<string>; ids: Set<string> } | null = null;

export function clearPosAdminCache(): void {
  adminsCache = null;
}

async function admins(): Promise<{ emails: Set<string>; ids: Set<string> } | null> {
  if (adminsCache && Date.now() - adminsCache.at < ADMINS_TTL_MS) return adminsCache;
  if (!isPosCatalogConfigured()) return null;
  try {
    const list = await listWebAdmins();
    if (!list) return null;
    adminsCache = {
      at: Date.now(),
      emails: new Set(list.map((a) => a.email.trim().toLowerCase())),
      ids: new Set(list.map((a) => a.userId)),
    };
    return adminsCache;
  } catch (error) {
    console.error("[POS admins] no se pudo leer la lista:", error instanceof Error ? error.message : error);
    return null;
  }
}

/** ¿El correo es de un admin de la web según el POS? `null` = no se sabe (POS caído o sin integración). */
export async function isPosAdminEmail(email: string): Promise<boolean | null> {
  const list = await admins();
  return list ? list.emails.has(email.trim().toLowerCase()) : null;
}

/**
 * ¿El admin de la sesión (id del POS) sigue siendo admin activo de la web? `null` = no se sabe: la sesión se
 * conserva hasta que el POS vuelva a responder.
 */
export async function isActivePosAdmin(userId: string): Promise<boolean | null> {
  const list = await admins();
  return list ? list.ids.has(userId) : null;
}

/**
 * Login de un admin: el POS verifica la contraseña (la misma con la que entra al POS), que siga siendo admin
 * de la web y esté activo, y limita los intentos fallidos. Si el POS no responde no hay respaldo local.
 */
export async function verifyPosAdminLogin(
  email: string,
  password: string,
  clientIp: string | null,
): Promise<PosAdminLogin> {
  if (!isPosCatalogConfigured()) return { outcome: "unavailable", admin: null };
  try {
    const result = await verifyWebAdmin(email, password, clientIp);
    return result.valid && result.admin
      ? { outcome: "valid", admin: result.admin }
      : { outcome: "invalid", admin: null };
  } catch (error) {
    if (error instanceof PosApiError && error.status === 429) return { outcome: "too_many_attempts", admin: null };
    console.error("[POS admins] no se pudo verificar el acceso:", error instanceof Error ? error.message : error);
    return { outcome: "unavailable", admin: null };
  }
}
