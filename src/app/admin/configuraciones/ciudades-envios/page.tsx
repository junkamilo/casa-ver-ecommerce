import { redirect } from "next/navigation";
import { posShippingUrl } from "@/lib/pos-links";

/** Ruta vieja: la cobertura por municipio se administra en el POS (Configuración → Ciudades de envíos). */
export default function CiudadesEnviosPage() {
  redirect(posShippingUrl("cities"));
}
