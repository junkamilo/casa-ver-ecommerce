"use client";

import { useState } from "react";
import { X, Package, MapPin, Truck, CheckCircle2, AlertCircle } from "lucide-react";
import { Order } from "../types";
import { formatOrderDate, formatOrderPrice } from "../constants";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderItemRow } from "./OrderItemRow";

interface Props {
  order: Order;
  onClose: () => void;
  onDelivered?: (id: string) => void;
}

export function OrderDetailModal({ order, onClose, onDelivered }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  async function handleConfirmDelivery() {
    setConfirming(true);
    setConfirmError(null);
    try {
      const res = await fetch(`/api/profile/orders/${order.id}/confirm-delivery`, {
        method: "POST",
      });
      if (res.ok) {
        onDelivered?.(order.id);
        onClose();
      } else {
        const body = await res.json().catch(() => ({}));
        setConfirmError(
          (body as { message?: string }).message ?? "No se pudo confirmar. Intenta de nuevo."
        );
      }
    } catch {
      setConfirmError("Error de conexión. Verifica tu red e intenta de nuevo.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#154734]/10 rounded-lg shrink-0">
              <Package className="w-4 h-4 text-[#154734]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Mis Pedidos</h2>
              <p className="text-xs text-gray-500">{order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-5">

            {/* Estado + Fecha */}
            <div className="flex items-center justify-between">
              <OrderStatusBadge status={order.status} />
              <span className="text-xs text-gray-500">{formatOrderDate(order.createdAt)}</span>
            </div>

            {/* Productos */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Productos
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                {order.items.map((item) => (
                  <div key={item.id} className="px-3">
                    <OrderItemRow item={item} />
                  </div>
                ))}
              </div>
            </div>

            {/* Dirección de envío */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Dirección de envío
              </h3>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800">{order.shippingAddress.fullName}</p>
                  <p className="mt-0.5">{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.department}
                  </p>
                </div>
              </div>
            </div>

            {/* Código de seguimiento */}
            {order.trackingCode && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Seguimiento
                </h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-xs">
                  <Truck className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-mono tracking-wide text-gray-700">{order.trackingCode}</span>
                </div>
              </div>
            )}

            {/* Confirmar entrega */}
            {order.status === "SHIPPED" && (
              <div className="space-y-2">
                {confirmError && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-700">{confirmError}</p>
                  </div>
                )}
                <button
                  onClick={handleConfirmDelivery}
                  disabled={confirming}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#154734] text-white text-sm font-bold rounded-xl hover:bg-[#103a2a] active:scale-95 transition-all disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {confirming ? "Confirmando..." : "Confirmar que recibí mi pedido"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer — Total */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between shrink-0">
          <span className="text-sm text-gray-500">Total del pedido</span>
          <span className="text-base font-bold text-gray-900">{formatOrderPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
