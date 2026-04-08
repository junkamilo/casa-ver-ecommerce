"use client";

import { Package, Eye } from "lucide-react";
import { Order } from "../types";
import { formatOrderDate, formatOrderPrice } from "../constants";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface Props {
  order: Order;
  onOpenDetail: (order: Order) => void;
}

export function OrderCard({ order, onOpenDetail }: Props) {
  return (
    <div className="flex items-center gap-3 p-4 sm:p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-[#154734]/30 hover:shadow-md transition-all">
      {/* Icono */}
      <div className="p-2 bg-[#154734]/10 rounded-lg shrink-0">
        <Package className="w-4 h-4 text-[#154734]" />
      </div>

      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-gray-900">{order.orderNumber}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{formatOrderDate(order.createdAt)}</p>
      </div>

      {/* Items count */}
      <span className="text-xs text-gray-400 shrink-0 hidden sm:block">
        {order.items.length} {order.items.length === 1 ? "ítem" : "ítems"}
      </span>

      {/* Total */}
      <span className="text-sm font-bold text-gray-900 shrink-0 hidden sm:block">
        {formatOrderPrice(order.total)}
      </span>

      {/* Botón ver detalle */}
      <button
        onClick={() => onOpenDetail(order)}
        className="p-2 text-gray-400 hover:text-[#154734] hover:bg-[#154734]/10 rounded-lg transition-colors shrink-0 active:scale-90"
        title="Ver detalle"
        aria-label="Ver detalle del pedido"
      >
        <Eye className="w-4 h-4" />
      </button>
    </div>
  );
}
