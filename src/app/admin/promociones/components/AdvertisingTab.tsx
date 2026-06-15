"use client";

import AdminDataTable from "@/components/ui/AdminDataTable";
import AdminToast from "@/app/admin/components/AdminToast";
import AdminConfirmModal from "@/app/admin/components/AdminConfirmModal";
import { PLACEMENT_LABELS } from "@/modules/adminCatalog/promoPopups/domain/promo-popup.entity";
import type { PromoPopupListItemDTO } from "@/modules/adminCatalog/promoPopups/contracts/promo-popup.dto";
import { useAdvertisingManager } from "../hooks/useAdvertisingManager";
import AdvertisingFormPanel from "./AdvertisingFormPanel";
import { Loader2, Megaphone, Pencil, Power, Trash2 } from "lucide-react";

export default function AdvertisingTab() {
  const m = useAdvertisingManager();

  const columns = [
    {
      key: "name",
      header: "Nombre",
      render: (row: PromoPopupListItemDTO) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-500">{row.headline}</p>
        </div>
      ),
    },
    {
      key: "placement",
      header: "Ubicación",
      render: (row: PromoPopupListItemDTO) => (
        <span className="text-sm text-gray-700">{PLACEMENT_LABELS[row.placement]}</span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (row: PromoPopupListItemDTO) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
            row.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.isActive ? "Activa" : "Inactiva"}
        </span>
      ),
    },
    {
      key: "schedule",
      header: "Vigencia",
      render: (row: PromoPopupListItemDTO) => (
        <span className="text-sm text-gray-500">{row.scheduleLabel}</span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      align: "right" as const,
      render: (row: PromoPopupListItemDTO) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => m.startEdit(row)}
            title="Editar"
            className="p-2 text-gray-400 hover:text-[#154734] bg-gray-50 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => m.handleToggleActive(row)}
            disabled={m.actionId === row.id}
            title={row.isActive ? "Desactivar" : "Activar"}
            className="p-2 text-gray-400 hover:text-amber-600 bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {m.actionId === row.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Power className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => m.handleDelete(row)}
            disabled={m.actionId === row.id}
            title="Eliminar"
            className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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

      <AdvertisingFormPanel
        key={m.formSeedKey}
        initialForm={m.formSeed}
        editingId={m.editingId}
        saving={m.saving}
        onSave={(form) => void m.handleSave(form)}
        onReset={m.resetForm}
        onCopyCode={(code) => void m.copyCode(code)}
      />

      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Publicidades creadas</h2>
        <AdminDataTable
          columns={columns}
          data={m.items}
          loading={m.loading}
          rowKey={(row) => row.id}
          emptyState={{
            title: "Sin publicidades",
            description: "Crea una ventana emergente para Home, Producto o Checkout.",
            icon: <Megaphone className="w-7 h-7 text-[#154734]/40" />,
          }}
        />
      </section>
    </div>
  );
}
