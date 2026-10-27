import { redirect } from "next/navigation";
import { posShippingUrl } from "@/lib/pos-links";

/** Ruta vieja: las tarifas, el envío gratis y las ciudades de envío se administran en el POS. */
export default function ConfiguracionesIndexPage() {
  redirect(posShippingUrl("prices"));
}
