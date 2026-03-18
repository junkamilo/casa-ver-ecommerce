"use client";

import { usePedidos } from "./hooks/usePedidos";
import { PedidosFilters } from "./components/PedidosFilters";
import { PedidosTable } from "./components/PedidosTable";
import { PedidosMobileList } from "./components/PedidosMobileList";
import { PedidoDetailModal } from "./components/PedidoDetailModal";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import AdminPagination from "@/components/ui/AdminPagination";

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
    paginatedOrders,
    page,
    setPage,
    totalPages,
    pageSize,
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
      <AdminPageHeader title="Pedidos" />
      <PedidosFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        methodFilter={methodFilter}
        onMethodChange={setMethodFilter}
      />
      <PedidosTable orders={paginatedOrders} onViewDetail={setDetailOrder} />
      <PedidosMobileList
        orders={paginatedOrders}
        expandedOrder={expandedOrder}
        onToggleExpand={setExpandedOrder}
        onViewDetail={setDetailOrder}
      />
      <AdminPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={filteredOrders.length}
        pageSize={pageSize}
        itemLabel="pedidos"
      />
      {detailOrder && (
        <PedidoDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} onStatusUpdated={handleStatusUpdated} />
      )}
    </div>
  );
}
