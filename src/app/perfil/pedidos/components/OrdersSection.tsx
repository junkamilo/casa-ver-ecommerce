"use client";

import { Package, AlertCircle } from "lucide-react";
import { useOrders } from "../hooks/useOrders";
import { OrderCard } from "./OrderCard";
import { OrderEmptyState } from "./OrderEmptyState";
import { OrderSkeleton } from "./OrderSkeleton";
import { OrderFilters } from "./OrderFilters";

export function OrdersSection() {
  const {
    filteredOrders,
    activeFilter,
    setFilter,
    isLoading,
    error,
    expandedId,
    toggleExpand,
    orderCountByStatus,
    markDelivered,
  } = useOrders();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#154734]" />
            Mis Pedidos
          </h2>
          {!error && (
            <span className="text-xs text-gray-400">
              {filteredOrders.length} {filteredOrders.length === 1 ? "pedido" : "pedidos"}
            </span>
          )}
        </div>
        {!error && (
          <OrderFilters
            active={activeFilter}
            onChange={setFilter}
            countByStatus={orderCountByStatus}
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-3">
        {isLoading ? (
          <>
            <OrderSkeleton />
            <OrderSkeleton />
            <OrderSkeleton />
          </>
        ) : error ? (
          <div className="flex items-start gap-3 px-4 py-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">No pudimos cargar tus pedidos</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <OrderEmptyState hasActiveFilter={activeFilter !== "ALL"} />
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isExpanded={expandedId === order.id}
              onToggle={() => toggleExpand(order.id)}
              onDelivered={markDelivered}
            />
          ))
        )}
      </div>
    </div>
  );
}
