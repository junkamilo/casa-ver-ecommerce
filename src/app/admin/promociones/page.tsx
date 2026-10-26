import { redirect } from "next/navigation";

/** Ruta vieja: los cupones pasaron al POS y la publicidad quedó en /admin/popups. */
export default function AdminPromocionesPage() {
  redirect("/admin/popups");
}
