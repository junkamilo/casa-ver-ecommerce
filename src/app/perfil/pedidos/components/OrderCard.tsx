"use client";

import Image from "next/image";
import { Package, Eye, CreditCard } from "lucide-react";
import { OrderCardProps } from "../types";
import { formatOrderDate, formatOrderPrice } from "../constants";
import { OrderStatusBadge } from "./OrderStatusBadge";

const PAYMENT_LABELS: Record<string, string> = {
  bold:          "Bold",
  addi:          "Addi",
  cash:          "Contraentrega",
  bank_transfer: "Transferencia",
};

const MAX_THUMBS = 3;

export function OrderCard({ order, onOpenDetail }: OrderCardProps) {
  const thumbs = order.items.slice(0, MAX_THUMBS);
  const overflow = order.items.length - MAX_THUMBS;

  return (
    <div className="flex items-center gap-3 p-4 sm:p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-[#154734]/30 hover:shadow-md transition-all">
      {/* Thumbnails (desktop) / ícono fallback (mobile) */}
      <div className="shrink-0 hidden sm:flex items-center">
        {thumbs.length > 0 ? (
          <div className="flex -space-x-2">
            {thumbs.map((item, i) => (
              <div
                key={item.id}
                className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-white bg-gray-100 shadow-sm"
                style={{ zIndex: MAX_THUMBS - i }}
              >
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
            {overflow > 0 && (
              <div
                className="relative w-10 h-10 rounded-lg border-2 border-white bg-gray-100 shadow-sm flex items-center justify-center"
                style={{ zIndex: 0 }}
              >
                <span className="text-[10px] font-bold text-gray-500">+{overflow}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2 bg-[#154734]/10 rounded-lg">
            <Package className="w-4 h-4 text-[#154734]" />
          </div>
        )}
      </div>

      {/* Ícono mobile */}
      <div className="p-2 bg-[#154734]/10 rounded-lg shrink-0 sm:hidden">
        <Package className="w-4 h-4 text-[#154734]" />
      </div>

      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-gray-900">{order.orderNumber}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <p className="text-xs text-gray-500">{formatOrderDate(order.createdAt)}</p>
          {order.paymentMethod && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
            </span>
          )}
        </div>
      </div>

      {/* Items count */}
      <span className="text-xs text-gray-400 shrink-0 hidden sm:block">
        {order.items.length} {order.items.length === 1 ? "ítem" : "ítems"}
      </span>

      {/* Total */}
      <span className="text-sm font-bold text-gray-900 shrink-0 hidden sm:block">
        {formatOrderPrice(order.total)}
      </span>

      {/* Ver detalle */}
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
