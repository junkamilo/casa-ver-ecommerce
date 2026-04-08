"use client";

import { Package, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useOrders } from "../hooks/useOrders";
import { OrderCard } from "./OrderCard";
import { OrderDetailModal } from "./OrderDetailModal";
import { OrderEmptyState } from "./OrderEmptyState";
import { OrderSkeleton } from "./OrderSkeleton";
import { OrderFilters } from "./OrderFilters";

export function OrdersSection() {
  const {
    paginatedOrders,
    filteredOrders,
    activeFilter,
    setFilter,
    isLoading,
    error,
    selectedOrder,
    openOrder,
    closeOrder,
    orderCountByStatus,
    markDelivered,
    currentPage,
    totalPages,
    setPage,
  } = useOrders();

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#154734]" />
              Mis Pedidos
            </h2>
            {!error && !isLoading && (
              <span className="text-xs text-gray-400">
                {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "pedido" : "pedidos"}
              </span>
            )}
          </div>

          {/* Filtros */}
          {!error && (
            <OrderFilters
              active={activeFilter}
              onChange={setFilter}
              countByStatus={orderCountByStatus}
            />
          )}
        </div>

        {/* Lista de pedidos */}
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
                <p className="text-sm font-semibold text-red-700">
                  No pudimos cargar tus pedidos
                </p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <OrderEmptyState hasActiveFilter={activeFilter !== "ALL"} />
          ) : (
            paginatedOrders.map((order) => (
              <OrderCard key={order.id} order={order} onOpenDetail={openOrder} />
            ))
          )}
        </div>

        {/* Paginación */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="px-5 pb-5 flex items-center justify-between gap-3">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-[#154734]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                    page === currentPage
                      ? "bg-[#154734] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-[#154734]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Siguiente
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={closeOrder}
          onDelivered={markDelivered}
        />
      )}
    </>
  );
}
