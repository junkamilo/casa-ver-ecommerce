import { redirect } from "next/navigation";
import { posShippingUrl } from "@/lib/pos-links";

/** Ruta vieja: las tarifas y el envío gratis se administran en el POS (Configuración → Precio de envíos). */
export default function PrecioEnviosPage() {
  redirect(posShippingUrl("prices"));
}
