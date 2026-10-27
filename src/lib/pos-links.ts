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

/** Configuración → Precio de envíos / Ciudades de envíos del POS (tarifas, envío gratis y cobertura). */
export function posShippingUrl(section: "prices" | "cities" = "prices"): string {
  return `${POS_APP_URL}/settings/${section === "cities" ? "shipping-cities" : "shipping-prices"}`;
}

/** Configuraciones → Usuarios del POS: ahí se crean los admins de la web y se cambian sus contraseñas. */
export function posUsersUrl(): string {
  return `${POS_APP_URL}/settings/users`;
}

/** Tienda → Productos del POS: ahí se crean y editan productos, variantes, precios, fotos e inventario. */
export function posProductsUrl(): string {
  return `${POS_APP_URL}/products`;
}
