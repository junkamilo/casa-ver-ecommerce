"use client";

import { useEffect, useRef } from "react";
import {
  Package, AlertCircle, ChevronLeft, ChevronRight,
  Search, X, ArrowUpDown, ShoppingBag, TrendingUp, CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useOrders } from "../hooks/useOrders";
import { OrderCard } from "./OrderCard";
import { OrderDetailModal } from "./OrderDetailModal";
import { OrderEmptyState } from "./OrderEmptyState";
import { OrderSkeleton } from "./OrderSkeleton";
import { OrderFilters } from "./OrderFilters";
import { formatOrderPrice } from "../constants";
import { SortBy } from "../types";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "newest",  label: "Más reciente" },
  { value: "oldest",  label: "Más antiguo" },
  { value: "highest", label: "Mayor total" },
  { value: "lowest",  label: "Menor total" },
];

export function OrdersSection() {
  const {
    paginatedOrders,
    filteredOrders,
    activeFilter,
    setFilter,
    searchQuery,
    setSearch,
    sortBy,
    setSortBy,
    isLoading,
    error,
    retryLoad,
    selectedOrder,
    openOrder,
    closeOrder,
    orderCountByStatus,
    stats,
    markDelivered,
    currentPage,
    totalPages,
    setPage,
  } = useOrders();

  // Scroll to top al cambiar de página
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 space-y-4">

          {/* Título + contador */}
          <div className="flex items-center justify-between">
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

          {/* Stats strip — solo si hay pedidos y sin error */}
          {!error && !isLoading && stats.total > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="flex flex-col items-center justify-center gap-0.5 p-2 sm:p-3 bg-gray-50 rounded-xl border border-gray-100">
                <ShoppingBag className="w-4 h-4 text-[#154734]" />
                <span className="text-base font-bold text-gray-900">{stats.total}</span>
                <span className="text-[10px] text-gray-500 text-center leading-tight">Pedidos</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-0.5 p-2 sm:p-3 bg-gray-50 rounded-xl border border-gray-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-base font-bold text-gray-900">{stats.delivered}</span>
                <span className="text-[10px] text-gray-500 text-center leading-tight">Entregados</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-0.5 p-2 sm:p-3 bg-gray-50 rounded-xl border border-gray-100">
                <TrendingUp className="w-4 h-4 text-[#C19A6B]" />
                <span className="text-[11px] sm:text-sm font-bold text-gray-900 text-center leading-tight">
                  {formatOrderPrice(stats.totalSpent)}
                </span>
                <span className="text-[10px] text-gray-500 text-center leading-tight">Total gastado</span>
              </div>
            </div>
          )}

          {/* Filtros por estado */}
          {!error && (
            <OrderFilters
              active={activeFilter}
              onChange={setFilter}
              countByStatus={orderCountByStatus}
            />
          )}

          {/* Búsqueda + orden */}
          {!error && !isLoading && stats.total > 0 && (
            <div className="flex gap-2">
              {/* Input de búsqueda */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por número de pedido..."
                  className="w-full pl-8 pr-8 py-2 text-xs rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none bg-gray-50 transition-all"
                />
                {hasSearch && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Selector de orden */}
              <div className="relative">
                <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="pl-7 pr-3 py-2 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none appearance-none cursor-pointer transition-all text-gray-600"
                  aria-label="Ordenar pedidos"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Lista de pedidos */}
        <div ref={listRef} className="p-4 sm:p-5 space-y-3 scroll-mt-4">
          {isLoading ? (
            <>
              <OrderSkeleton />
              <OrderSkeleton />
              <OrderSkeleton />
            </>
          ) : error ? (
            <div className="flex flex-col items-start gap-3 px-4 py-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">No pudimos cargar tus pedidos</p>
                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
              <button
                onClick={retryLoad}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 active:scale-95 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                Reintentar
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <OrderEmptyState hasActiveFilter={activeFilter !== "ALL"} hasSearch={hasSearch} />
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
