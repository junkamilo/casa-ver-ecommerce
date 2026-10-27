import { redirect } from "next/navigation";
import { posUsersUrl } from "@/lib/pos-links";

/** Ruta vieja: los administradores de la web se gestionan en el POS (Configuraciones → Usuarios). */
export default function AdministradoresPage() {
  redirect(posUsersUrl());
}
