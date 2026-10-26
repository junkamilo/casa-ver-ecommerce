/**
 * Enlaces al POS. Los pedidos web se despachan, se les asigna guía y se anulan solo en el POS
 * (Tienda → Pedidos); la web ya no tiene panel de pedidos.
 */
const POS_APP_URL = (process.env.NEXT_PUBLIC_POS_APP_URL || "https://pos.casaverdeoficial.com").replace(/\/+$/, "");

/** Tienda → Pedidos del POS; con número, abre ese pedido. */
export function posOrdersUrl(orderNumber?: string | null): string {
  return orderNumber ? `${POS_APP_URL}/pedidos?pedido=${encodeURIComponent(orderNumber)}` : `${POS_APP_URL}/pedidos`;
}
