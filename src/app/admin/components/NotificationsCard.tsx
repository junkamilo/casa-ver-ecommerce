import Link from "next/link";
import { Bell, CheckCircle2, Clock, ChevronDown, ArrowUpRight } from "lucide-react";
import { mapOrderStatus, formatCOP, timeAgo } from "../constants";
import type { RecentOrder } from "../types";

interface Props {
  orders: RecentOrder[];
}

export default function NotificationsCard({ orders }: Props) {
  return (
    <details
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      open
    >
      {/* SUMMARY: header clicable para expandir / colapsar */}
      <summary className="px-4 py-3 flex items-center justify-between cursor-pointer list-none select-none active:bg-gray-50 transition-colors [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#154734]/10 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#154734]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-tight">Pedidos recientes</h2>
            <p className="text-[11px] text-gray-400 leading-tight">{orders.length} últimos pagados</p>
          </div>
        </div>
        {/* Flecha que rota al abrir/cerrar */}
        <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
      </summary>

      {/* Enlace "Ver todos" visible solo cuando está abierto */}
      <div className="px-4 py-2 border-b border-gray-100 flex justify-end">
        <Link
          href="/admin/pedidos"
          className="text-xs font-semibold text-[#154734] flex items-center gap-0.5 active:opacity-70 transition-opacity"
        >
          Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Lista de notificaciones */}
      <div className="divide-y divide-gray-50">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 font-medium">Sin notificaciones</p>
          </div>
        ) : (
          orders.map((order) => {
            const statusInfo = mapOrderStatus(order.status);
            return (
              <div
                key={order.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50/70 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 leading-snug">
                    Pedido pagado ·{" "}
                    <span className="text-[#154734]">{order.orderNumber}</span>
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {order.user?.name ?? "Cliente sin nombre"}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.styleClass}`}
                    >
                      {statusInfo.label}
                    </span>
                    <span className="text-[11px] font-bold text-gray-700">
                      {formatCOP(order.total)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-[10px] text-gray-400 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span className="whitespace-nowrap">{timeAgo(order.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </details>
  );
}
