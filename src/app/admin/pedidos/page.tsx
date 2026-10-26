import { redirect } from "next/navigation";
import { posOrdersUrl } from "@/lib/pos-links";

/** Ruta vieja: los pedidos web se gestionan en el POS (Tienda → Pedidos). `?abrir=` abre ese pedido. */
export default async function AdminPedidosPage({ searchParams }: { searchParams: Promise<{ abrir?: string }> }) {
  const { abrir } = await searchParams;
  redirect(posOrdersUrl(abrir));
}
