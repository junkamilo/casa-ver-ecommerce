/**
 * Enlaces al POS. Los pedidos web se despachan, se les asigna guía y se anulan solo en el POS
 * (Tienda → Pedidos), y las tarifas, el envío gratis y las ciudades de envío se administran solo en el POS;
 * la web ya no tiene paneles para eso.
 */
const POS_APP_URL = (process.env.NEXT_PUBLIC_POS_APP_URL || "https://pos.casaverdeoficial.com").replace(/\/+$/, "");

/** Tienda → Pedidos del POS; con número, abre ese pedido. */
export function posOrdersUrl(orderNumber?: string | null): string {
  return orderNumber ? `${POS_APP_URL}/pedidos?pedido=${encodeURIComponent(orderNumber)}` : `${POS_APP_URL}/pedidos`;
}
