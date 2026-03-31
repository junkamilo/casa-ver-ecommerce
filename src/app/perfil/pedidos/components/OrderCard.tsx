"use client";

import { useState } from "react";
import { ChevronDown, Package, MapPin, Truck, CheckCircle2, AlertCircle } from "lucide-react";
import { Order } from "../types";
import { formatOrderDate, formatOrderPrice } from "../constants";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderItemRow } from "./OrderItemRow";

interface Props {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
  onDelivered?: (id: string) => void;
}

export function OrderCard({ order, isExpanded, onToggle, onDelivered }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Usa order.status directamente desde el prop — el padre (useOrders) es la fuente de verdad.
  // Cuando onDelivered actualiza el store, el prop se re-renderiza con el nuevo estado.
  const status = order.status;

  async function handleConfirmDelivery() {
    setConfirming(true);
    setConfirmError(null);
    try {
      const res = await fetch(`/api/profile/orders/${order.id}/confirm-delivery`, {
        method: "POST",
      });
      if (res.ok) {
        onDelivered?.(order.id);
      } else {
        const body = await res.json().catch(() => ({}));
        setConfirmError((body as { message?: string }).message ?? "No se pudo confirmar. Intenta de nuevo.");
      }
    } catch {
      setConfirmError("Error de conexión. Verifica tu red e intenta de nuevo.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden touch-target">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-[#154734]/10 rounded-lg shrink-0">
            <Package className="w-4 h-4 text-[#154734]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900">{order.orderNumber}</span>
              <OrderStatusBadge status={status} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{formatOrderDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <span className="text-sm font-bold text-gray-900 hidden sm:block">
            {formatOrderPrice(order.total)}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-4 sm:px-5 pb-5">
          {/* Product list */}
          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <OrderItemRow key={item.id} item={item} />
            ))}
          </div>

          {/* Shipping + tracking */}
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700 mb-0.5">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.department}
                </p>
              </div>
            </div>

            {order.trackingCode && (
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <Truck className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700 mb-0.5">Código de seguimiento</p>
                  <p className="font-mono tracking-wide">{order.trackingCode}</p>
                </div>
              </div>
            )}
          </div>

          {/* Confirmar entrega */}
          {status === "SHIPPED" && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              {confirmError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-700">{confirmError}</p>
                </div>
              )}
              <button
                onClick={handleConfirmDelivery}
                disabled={confirming}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#154734] text-white text-sm font-bold rounded-lg hover:bg-[#103a2a] active:scale-95 transition-all disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                {confirming ? "Confirmando..." : "Confirmar que recibí mi pedido"}
              </button>
            </div>
          )}

          {/* Total */}
          <div className="mt-4 flex justify-end">
            <p className="text-sm text-gray-500">
              Total:{" "}
              <span className="font-bold text-gray-900">{formatOrderPrice(order.total)}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
