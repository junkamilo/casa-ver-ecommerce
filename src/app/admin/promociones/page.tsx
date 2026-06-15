"use client";

import { useState } from "react";
import AdminDataTable from "@/components/ui/AdminDataTable";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import AdminPagination from "@/components/ui/AdminPagination";
import CouponUsageModal from "./components/CouponUsageModal";
import PromotionalCouponsTab from "./components/PromotionalCouponsTab";
import AdvertisingTab from "./components/AdvertisingTab";
import type { CouponListItemDTO } from "@/modules/adminCatalog/coupons/contracts/coupon.dto";
import { Copy, Eye, Loader2, Search, TicketPercent, Trash2 } from "lucide-react";
import { useCouponManager } from "./hooks/useCouponManager";
import AdminToast from "@/app/admin/components/AdminToast";
import AdminConfirmModal from "@/app/admin/components/AdminConfirmModal";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBatchLabel(coupon: CouponListItemDTO) {
  if (coupon.batchCreatedAt) return formatDate(coupon.batchCreatedAt);
  if (coupon.batchId) return coupon.batchId.slice(0, 8);
  return "—";
}

export default function AdminPromocionesPage() {
  const [activeTab, setActiveTab] = useState<"batch" | "promotional" | "advertising">("batch");
  const m = useCouponManager();

  const columns = [
    {
      key: "code",
      header: "Código",
      render: (row: CouponListItemDTO) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-gray-900">{row.code}</span>
          <button
            type="button"
            onClick={() => m.copyCode(row.code)}
            title="Copiar código"
            className="p-1.5 text-gray-400 hover:text-[#154734] bg-gray-50 rounded-lg transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
    {
      key: "discount",
      header: "Descuento",
      render: (row: CouponListItemDTO) => (
        <span className="text-sm font-semibold text-[#154734]">{row.discountPercentage}%</span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (row: CouponListItemDTO) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
            row.isUsed ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.isUsed ? "Usado" : "Disponible"}
        </span>
      ),
    },
    {
      key: "batch",
      header: "Lote",
      render: (row: CouponListItemDTO) => (
        <span className="text-sm text-gray-600">{formatBatchLabel(row)}</span>
      ),
    },
    {
      key: "created",
      header: "Creado",
      render: (row: CouponListItemDTO) => (
        <span className="text-sm text-gray-500">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      align: "right" as const,
      render: (row: CouponListItemDTO) =>
        row.isUsed ? (
          <button
            type="button"
            onClick={() => m.openUsageDetail(row)}
            title="Ver comprador"
            className="p-2 text-gray-400 hover:text-[#154734] bg-gray-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => m.handleDelete(row)}
            disabled={m.deletingId === row.id}
            title="Eliminar"
            className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {m.deletingId === row.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        ),
    },
  ];

  const mobileRender = (row: CouponListItemDTO) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-sm font-semibold truncate">{row.code}</span>
          <button
            type="button"
            onClick={() => m.copyCode(row.code)}
            className="p-1.5 text-gray-400 hover:text-[#154734] bg-gray-50 rounded-lg shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-sm font-semibold text-[#154734] shrink-0">{row.discountPercentage}%</span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span
          className={`px-2 py-0.5 rounded-full font-semibold ${
            row.isUsed ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.isUsed ? "Usado" : "Disponible"}
        </span>
        <span>{formatDate(row.createdAt)}</span>
      </div>
      {row.isUsed ? (
        <button
          type="button"
          onClick={() => m.openUsageDetail(row)}
          className="text-xs text-[#154734] font-semibold flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          Ver comprador
        </button>
      ) : (
        <button
          type="button"
          onClick={() => m.handleDelete(row)}
          disabled={m.deletingId === row.id}
          className="text-xs text-red-500 font-semibold"
        >
          Eliminar
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen font-sans">
      <AdminToast toast={m.toast} />
      <AdminConfirmModal
        open={!!m.confirmModal}
        title={m.confirmModal?.title ?? ""}
        description={m.confirmModal?.description ?? ""}
        confirmLabel={m.confirmModal?.confirmLabel}
        variant={m.confirmModal?.variant}
        loading={m.confirmLoading}
        onConfirm={m.runConfirmAction}
        onCancel={m.closeConfirmModal}
      />

      <AdminPageHeader title="Promociones" />

      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("batch")}
          className={`px-4 py-2 text-sm font-semibold -mb-px transition-colors ${
            activeTab === "batch"
              ? "text-[#154734] border-b-2 border-[#154734]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Cupones
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("promotional")}
          className={`px-4 py-2 text-sm font-semibold -mb-px transition-colors ${
            activeTab === "promotional"
              ? "text-[#154734] border-b-2 border-[#154734]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Código promocional
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("advertising")}
          className={`px-4 py-2 text-sm font-semibold -mb-px transition-colors ${
            activeTab === "advertising"
              ? "text-[#154734] border-b-2 border-[#154734]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Publicidad
        </button>
      </div>

      {activeTab === "advertising" ? (
        <AdvertisingTab />
      ) : activeTab === "promotional" ? (
        <PromotionalCouponsTab />
      ) : (
        <>
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-bold text-gray-900">Generar cupones</h2>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="space-y-1.5">
            <label htmlFor="discount" className="text-xs font-semibold text-gray-500 uppercase">
              Descuento
            </label>
            <input
              id="discount"
              type="text"
              inputMode="numeric"
              placeholder="Ej. 20"
              value={m.discountPercentage}
              onChange={(e) => m.setDiscountPercentage(e.target.value)}
              className="w-full sm:w-40 px-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="quantity" className="text-xs font-semibold text-gray-500 uppercase">
              Cantidad
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              max={100}
              value={m.quantity}
              onChange={(e) => m.setQuantity(Number(e.target.value))}
              className="w-full sm:w-32 px-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20"
            />
          </div>
          <button
            type="button"
            onClick={m.handleGenerate}
            disabled={m.generating}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#154734] text-white text-sm font-semibold rounded-xl hover:bg-[#154734]/90 transition-colors disabled:opacity-60"
          >
            {m.generating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Generar cupones
          </button>
        </div>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por código..."
          value={m.search}
          onChange={(e) => m.setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20 transition-all"
        />
      </div>

      <AdminDataTable
        columns={columns}
        data={m.coupons}
        loading={m.loading}
        paginated
        rowKey={(row) => row.id}
        getRowClassName={(row) => (row.isUsed ? m.usedRowClass : undefined)}
        mobileRender={mobileRender}
        emptyState={{
          title: "Sin cupones",
          description: "Genera un lote de cupones para empezar.",
          icon: <TicketPercent className="w-7 h-7 text-[#154734]/40" />,
        }}
        footer={
          <AdminPagination
            alwaysShow
            page={m.page}
            totalPages={m.totalPages}
            onPageChange={m.setPage}
            total={m.total}
            pageSize={m.pageSize}
            onPageSizeChange={m.setPageSize}
            itemLabel="cupones"
          />
        }
      />

      <CouponUsageModal
        isOpen={m.usageModalOpen}
        loading={m.usageLoading}
        detail={m.usageDetail}
        onClose={m.closeUsageDetail}
      />
        </>
      )}
    </div>
  );
}
