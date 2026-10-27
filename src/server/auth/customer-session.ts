import type { Session } from "next-auth";

/**
 * Las sesiones de administrador llevan el id del POS (los admins viven en el POS, no en Neon); las de cliente,
 * el id del usuario de la tienda en Neon. Las rutas de cliente (carrito, perfil, direcciones, pagos) solo
 * deben usar el id de un cliente.
 */
export function isAdminSession(session: Session | null | undefined): boolean {
  return (session?.user as { role?: string } | undefined)?.role === "ADMIN";
}

/** Id del cliente en Neon; `null` sin sesión o con sesión de administrador. */
export function customerUserId(session: Session | null | undefined): string | null {
  if (!session?.user || isAdminSession(session)) return null;
  const id = (session.user as { id?: string }).id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

/** Mensaje para las acciones de cliente intentadas con una cuenta de administrador. */
export const ADMIN_NOT_CUSTOMER_MESSAGE =
  "Las cuentas de administrador se gestionan en el POS y no tienen perfil de cliente. Para comprar, entra con tu cuenta de cliente.";
