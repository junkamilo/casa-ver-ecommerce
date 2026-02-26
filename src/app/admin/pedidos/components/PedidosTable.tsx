import { Eye, Receipt } from "lucide-react";
import { getStatusStyles, formatPrice } from "../constants";
import type { Order } from "../types";

interface PedidosTableProps {
  orders: Order[];
  onViewDetail: (order: Order) => void;
}

export function PedidosTable({ orders, onViewDetail }: PedidosTableProps) {
  return (
    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pedido</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Método</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
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

      {orders.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p>No se encontraron pedidos</p>
        </div>
      )}
    </div>
  );
}
