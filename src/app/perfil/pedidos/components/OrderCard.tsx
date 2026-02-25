import { ChevronDown, Package, MapPin, Truck } from "lucide-react";
import { Order } from "../types";
import { formatOrderDate, formatOrderPrice } from "../constants";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderItemRow } from "./OrderItemRow";

interface Props {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
}

export function OrderCard({ order, isExpanded, onToggle }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header row */}
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
              <OrderStatusBadge status={order.status} />
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
