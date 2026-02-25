"use client";

import { Package } from "lucide-react";
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
    expandedId,
    toggleExpand,
    orderCountByStatus,
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
          <span className="text-xs text-gray-400">
            {filteredOrders.length} {filteredOrders.length === 1 ? "pedido" : "pedidos"}
          </span>
        </div>
        <OrderFilters
          active={activeFilter}
          onChange={setFilter}
          countByStatus={orderCountByStatus}
        />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-3">
        {isLoading ? (
          <>
            <OrderSkeleton />
            <OrderSkeleton />
            <OrderSkeleton />
          </>
        ) : filteredOrders.length === 0 ? (
          <OrderEmptyState hasActiveFilter={activeFilter !== "ALL"} />
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isExpanded={expandedId === order.id}
              onToggle={() => toggleExpand(order.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
