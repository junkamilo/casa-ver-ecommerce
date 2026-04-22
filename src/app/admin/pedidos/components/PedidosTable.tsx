import { Eye } from "lucide-react";
import { getStatusStyles, formatPrice } from "../constants";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import type { PedidosTableProps } from "../types/types";

export function PedidosTable({ orders, onViewDetail }: PedidosTableProps) {
  return (
    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-auto max-h-150">
      <table className="w-full">
        <thead>
          <tr className="bg-[#F8F9FA] border-b border-gray-200">
            <th className="sticky top-0 z-20 bg-[#F8F9FA] px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(229,231,235,1)]">Pedido</th>
            <th className="sticky top-0 z-20 bg-[#F8F9FA] px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(229,231,235,1)]">Cliente</th>
            <th className="sticky top-0 z-20 bg-[#F8F9FA] px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(229,231,235,1)]">Total</th>
            <th className="sticky top-0 z-20 bg-[#F8F9FA] px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(229,231,235,1)]">Estado</th>
            <th className="sticky top-0 z-20 bg-[#F8F9FA] px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(229,231,235,1)]">Método</th>
            <th className="sticky top-0 z-20 bg-[#F8F9FA] px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(229,231,235,1)]">Fecha</th>
            <th className="sticky top-0 z-20 bg-[#F8F9FA] px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(229,231,235,1)]">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50/60 transition-colors group">
              <td className="px-6 py-4">
                <span className="text-sm font-semibold text-[#154734] bg-[#154734]/5 px-2 py-1 rounded">
                  {order.id}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{order.customer}</span>
                  <span className="text-xs text-gray-500">{order.email}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">{order.paymentMethod}</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {order.date.split(" ")[0]}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onViewDetail(order)}
                  className="p-2 text-gray-400 hover:text-[#C19A6B] hover:bg-orange-50 rounded-lg transition-colors"
                  title="Ver Detalle"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {orders.length === 0 && <SectionEmptyState message="No se encontraron pedidos." />}
    </div>
  );
}
