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
  } = usePedidos();

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
        <PedidoDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
      )}
    </div>
  );
}
