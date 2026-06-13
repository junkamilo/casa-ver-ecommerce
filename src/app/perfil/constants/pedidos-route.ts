export const PEDIDOS_PATH = "/perfil?section=pedidos";

export function getPedidosHref(isAuthenticated: boolean): string {
  return isAuthenticated
    ? PEDIDOS_PATH
    : `/login?returnTo=${encodeURIComponent(PEDIDOS_PATH)}`;
}
