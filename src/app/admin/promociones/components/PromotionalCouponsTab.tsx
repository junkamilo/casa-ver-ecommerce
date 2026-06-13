"use client";

import AdminDataTable from "@/components/ui/AdminDataTable";
import AdminPagination from "@/components/ui/AdminPagination";
import PromotionalCouponUsagesModal from "./PromotionalCouponUsagesModal";
import type { PromotionalCouponListItemDTO } from "@/modules/adminCatalog/coupons/contracts/coupon.dto";
import { formatCouponDiscountLabel } from "@/modules/checkout/domain/coupon.entity";
import { Copy, Eye, Loader2, Search, TicketPercent, Trash2, Ban } from "lucide-react";
import { CasaVerdeDatePicker, CasaVerdeTimePicker, getBogotaTodayIso } from "@/components/ui/date-time";
import AdminToast from "@/app/admin/components/AdminToast";
import AdminConfirmModal from "@/app/admin/components/AdminConfirmModal";
import { usePromotionalCouponManager } from "../hooks/usePromotionalCouponManager";

export default function PromotionalCouponsTab() {
  const m = usePromotionalCouponManager();
  const todayIso = getBogotaTodayIso();

  const columns = [
    {
      key: "code",
      header: "Código",
      render: (row: PromotionalCouponListItemDTO) => (
        <div className="space-y-0.5">
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
          {row.codeSource ? (
            <p className="text-xs text-gray-500">
              {m.codeSourceLabel[row.codeSource]}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "discount",
      header: "Descuento",
      render: (row: PromotionalCouponListItemDTO) => (
        <span className="text-sm font-semibold text-[#154734]">
          {formatCouponDiscountLabel(row.discountType, row.discountValue)}
        </span>
      ),
    },
    {
      key: "uses",
      header: "Usos",
      render: (row: PromotionalCouponListItemDTO) => (
        <span className="text-sm font-medium text-gray-700">
          {row.currentGlobalUses}/{row.maxGlobalUses}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (row: PromotionalCouponListItemDTO) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${m.statusClass[row.status]}`}
        >
          {m.statusLabel[row.status]}
        </span>
      ),
    },
    {
      key: "schedule",
      header: "Vigencia",
      render: (row: PromotionalCouponListItemDTO) => (
        <span className="text-sm text-gray-500">{row.scheduleLabel}</span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      align: "right" as const,
      render: (row: PromotionalCouponListItemDTO) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => m.openUsages(row)}
            title="Ver usos"
            className="p-2 text-gray-400 hover:text-[#154734] bg-gray-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.isActive && row.status !== "EXHAUSTED" ? (
            <button
              type="button"
              onClick={() => m.handleDeactivate(row)}
              disabled={m.actionId === row.id}
              title="Desactivar"
              className="p-2 text-gray-400 hover:text-amber-600 bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {m.actionId === row.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Ban className="w-4 h-4" />
              )}
            </button>
          ) : null}
          {row.currentGlobalUses === 0 ? (
            <button
              type="button"
              onClick={() => m.handleDelete(row)}
              disabled={m.actionId === row.id}
              title="Eliminar"
              className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
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

      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-bold text-gray-900">Crear código promocional</h2>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase">Tipo de código</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <label
              className={`flex items-start gap-3 flex-1 cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
                m.codeSource === "RANDOM"
                  ? "border-[#154734] bg-[#154734]/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="codeSource"
                value="RANDOM"
                checked={m.codeSource === "RANDOM"}
                onChange={() => m.setCodeSource("RANDOM")}
                className="mt-1 accent-[#154734]"
              />
              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  Generar código aleatorio
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  El sistema creará un código de 12 caracteres al guardar
                </span>
              </span>
            </label>
            <label
              className={`flex items-start gap-3 flex-1 cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
                m.codeSource === "CUSTOM"
                  ? "border-[#154734] bg-[#154734]/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="codeSource"
                value="CUSTOM"
                checked={m.codeSource === "CUSTOM"}
                onChange={() => m.setCodeSource("CUSTOM")}
                className="mt-1 accent-[#154734]"
              />
              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  Nombre personalizado
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  Tú defines el código que usarán los clientes (ej. VERDE20)
                </span>
              </span>
            </label>
          </div>
        </div>

        {m.codeSource === "CUSTOM" ? (
          <div className="space-y-1.5 max-w-md">
            <label htmlFor="promo-custom-code" className="text-xs font-semibold text-gray-500 uppercase">
              Nombre del cupón
            </label>
            <input
              id="promo-custom-code"
              type="text"
              placeholder="Ej. VERDE20"
              value={m.customCode ?? ""}
              onChange={(e) => m.setCustomCode(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20"
            />
            <p className="text-xs text-gray-400">4 a 20 caracteres, solo letras, números y guiones</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            El código se generará automáticamente al crear el cupón (12 caracteres alfanuméricos).
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase">Tipo descuento</label>
            <select
              value={m.discountType}
              onChange={(e) => m.setDiscountType(e.target.value as "PERCENTAGE" | "FIXED")}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20"
            >
              <option value="PERCENTAGE">Porcentaje (%)</option>
              <option value="FIXED">Monto fijo ($)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="promo-value" className="text-xs font-semibold text-gray-500 uppercase">
              Valor descuento
            </label>
            <input
              id="promo-value"
              type="text"
              inputMode="numeric"
              placeholder={m.discountType === "PERCENTAGE" ? "Ej. 20" : "Ej. 50000"}
              value={m.discountValue ?? ""}
              onChange={(e) => m.setDiscountValue(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="promo-max" className="text-xs font-semibold text-gray-500 uppercase">
              Usos totales
            </label>
            <input
              id="promo-max"
              type="number"
              min={1}
              max={10000}
              value={m.maxGlobalUses ?? 1}
              onChange={(e) => m.setMaxGlobalUses(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20"
            />
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={m.scheduleEnabled}
              onChange={(e) => m.setScheduleEnabled(e.target.checked)}
              className="mt-1 accent-[#154734]"
            />
            <span>
              <span className="block text-sm font-semibold text-gray-900">Activar vigencia</span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Sin marcar, el cupón estará disponible hasta agotar usos o desactivarlo manualmente
              </span>
            </span>
          </label>

          {m.scheduleEnabled ? (
            <div className="space-y-4 pl-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    m.scheduleMode === "SINGLE_DAY"
                      ? "border-[#154734] bg-white"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="scheduleMode"
                    value="SINGLE_DAY"
                    checked={m.scheduleMode === "SINGLE_DAY"}
                    onChange={() => m.setScheduleMode("SINGLE_DAY")}
                    className="mt-1 accent-[#154734]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">Un día específico</span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      Disponible solo ese día, con hora de inicio y fin
                    </span>
                  </span>
                </label>
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    m.scheduleMode === "DATE_RANGE"
                      ? "border-[#154734] bg-white"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="scheduleMode"
                    value="DATE_RANGE"
                    checked={m.scheduleMode === "DATE_RANGE"}
                    onChange={() => m.setScheduleMode("DATE_RANGE")}
                    className="mt-1 accent-[#154734]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">Rango de fechas</span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      Válido desde el primer día hasta el último, días completos
                    </span>
                  </span>
                </label>
              </div>

              {m.scheduleMode === "SINGLE_DAY" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <CasaVerdeDatePicker
                    id="promo-single-day"
                    label="Día"
                    value={m.singleDayDate ?? ""}
                    onChange={m.setSingleDayDate}
                    minDate={todayIso}
                  />
                  <CasaVerdeTimePicker
                    id="promo-start-time"
                    label="Hora inicio"
                    value={m.startTime ?? ""}
                    onChange={m.setStartTime}
                  />
                  <CasaVerdeTimePicker
                    id="promo-end-time"
                    label="Hora fin"
                    value={m.endTime ?? ""}
                    onChange={m.setEndTime}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CasaVerdeDatePicker
                    id="promo-from-date"
                    label="Desde"
                    value={m.fromDate ?? ""}
                    onChange={m.setFromDate}
                    minDate={todayIso}
                  />
                  <CasaVerdeDatePicker
                    id="promo-to-date"
                    label="Hasta"
                    value={m.toDate ?? ""}
                    onChange={m.setToDate}
                    minDate={m.fromDate || todayIso}
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={m.handleCreate}
          disabled={m.creating}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#154734] text-white text-sm font-semibold rounded-xl hover:bg-[#154734]/90 transition-colors disabled:opacity-60"
        >
          {m.creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Crear cupón promocional
        </button>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por código..."
          value={m.search ?? ""}
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
        emptyState={{
          title: "Sin códigos promocionales",
          description: "Crea un cupón compartido para empezar.",
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

      <PromotionalCouponUsagesModal
        isOpen={m.usagesModalOpen}
        loading={m.usagesLoading}
        couponCode={m.usagesCoupon?.code ?? null}
        usages={m.usages}
        onClose={m.closeUsages}
      />
    </div>
  );
}
