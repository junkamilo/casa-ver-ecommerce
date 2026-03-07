"use client";

import { usePedidos } from "./hooks/usePedidos";
import { PedidosHeader } from "./components/PedidosHeader";
import { PedidosFilters } from "./components/PedidosFilters";
import { PedidosTable } from "./components/PedidosTable";
import { PedidosMobileList } from "./components/PedidosMobileList";
import { PedidoDetailModal } from "./components/PedidoDetailModal";

export default function AdminPedidos() {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    methodFilter,
    setMethodFilter,
    expandedOrder,
    setExpandedOrder,
    detailOrder,
    setDetailOrder,
    filteredOrders,
    loading,
    handleStatusUpdated,
  } = usePedidos();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#154734] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-3 sm:p-6 bg-gray-50 min-h-screen font-sans">
      <PedidosHeader />
      <PedidosFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        methodFilter={methodFilter}
        onMethodChange={setMethodFilter}
      />
      <PedidosTable orders={filteredOrders} onViewDetail={setDetailOrder} />
      <PedidosMobileList
        orders={filteredOrders}
        expandedOrder={expandedOrder}
        onToggleExpand={setExpandedOrder}
        onViewDetail={setDetailOrder}
      />
      {detailOrder && (
        <PedidoDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} onStatusUpdated={handleStatusUpdated} />
      )}
    </div>
  );
}
