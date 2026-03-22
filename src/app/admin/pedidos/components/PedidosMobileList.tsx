"use client";

import { ChevronDown, ChevronUp, CreditCard, MapPin } from "lucide-react";
import { getStatusStyles, formatPrice } from "../constants";
import type { Order } from "../types";
import SectionEmptyState from "@/components/ui/SectionEmptyState";

interface PedidosMobileListProps {
  orders: Order[];
  expandedOrder: string | null;
  onToggleExpand: (id: string | null) => void;
  onViewDetail: (order: Order) => void;
}

export function PedidosMobileList({
  orders,
  expandedOrder,
  onToggleExpand,
  onViewDetail,
}: PedidosMobileListProps) {
  if (orders.length === 0) {
    return (
      <div className="md:hidden">
        <SectionEmptyState message="No se encontraron pedidos." />
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <button
            onClick={() => onToggleExpand(expandedOrder === order.id ? null : order.id)}
            className="w-full p-3 sm:p-4 text-left hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#154734] bg-[#154734]/5 px-2 py-1 rounded">
                {order.id}
              </span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getStatusStyles(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{order.customer}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{order.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-[#154734]">{formatPrice(order.total)}</span>
                {expandedOrder === order.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </button>

          {expandedOrder === order.id && (
            <div className="px-4 pb-4 pt-2 bg-gray-50/50 border-t border-gray-100 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-gray-600 bg-white p-2 rounded border border-gray-100">
                  <CreditCard className="w-3.5 h-3.5 text-[#C19A6B]" />
                  {order.paymentMethod}
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-white p-2 rounded border border-gray-100">
                  <MapPin className="w-3.5 h-3.5 text-[#C19A6B]" />
                  <span className="truncate">{order.address}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</p>
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.qty}x {item.name}</span>
                    <span className="font-medium text-gray-900">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onViewDetail(order)}
                className="w-full mt-2 py-2 text-center text-xs font-bold text-[#154734] hover:bg-[#154734]/5 rounded transition-colors"
              >
                Ver Factura Completa
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
