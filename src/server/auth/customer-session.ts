import type { Session } from "next-auth";

/** Id del cliente en Neon; `null` sin sesión. La web solo tiene clientes (los usuarios del POS entran al POS). */
export function customerUserId(session: Session | null | undefined): string | null {
  const id = (session?.user as { id?: string } | undefined)?.id;
  return typeof id === "string" && id.length > 0 ? id : null;
}
