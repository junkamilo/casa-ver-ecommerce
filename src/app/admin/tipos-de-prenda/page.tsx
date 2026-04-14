"use client";

import { useGarmentTypeManager } from "./hooks/useGarmentTypeManager";
import GarmentTypeModal from "./components/GarmentTypeModal";
import GarmentTypeList from "./components/GarmentTypeList";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import AdminPagination from "@/components/ui/AdminPagination";
import { Plus, Search } from "lucide-react";

function Toast({ toast }: { toast: { type: "success" | "error"; message: string } | null }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-[200] px-5 py-3.5 rounded-xl shadow-lg text-sm font-semibold transition-all ${
        toast.type === "success" ? "bg-[#154734] text-white" : "bg-red-600 text-white"
      }`}
    >
      {toast.message}
    </div>
  );
}

export default function AdminTiposDePrenda() {
  const m = useGarmentTypeManager();

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen font-sans">
      <Toast toast={m.toast} />

      <AdminPageHeader
        title="Tipos de Prenda"
        action={{ label: "Nuevo Tipo", onClick: () => m.setShowModal(true), icon: Plus }}
      />

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar tipo de prenda..."
          value={m.search}
          onChange={(e) => m.setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20 transition-all"
        />
      </div>

      <GarmentTypeList
        loading={m.loading}
        garmentTypes={m.paginatedGarmentTypes}
        onEdit={m.openEditModal}
        onToggleActive={m.handleToggleActive}
        onDelete={m.handleDelete}
      />

      <AdminPagination
        page={m.page}
        totalPages={m.totalPages}
        onPageChange={m.setPage}
        total={m.filteredGarmentTypes.length}
        pageSize={m.pageSize}
        itemLabel="tipos de prenda"
      />

      {/* Modal Crear */}
      <GarmentTypeModal
        isOpen={m.showModal}
        onClose={() => { m.setShowModal(false); m.setName(""); }}
        submitting={m.submitting}
        onSubmit={m.handleSubmit}
        name={m.name}
        setName={m.setName}
        mode="create"
      />

      {/* Modal Editar */}
      <GarmentTypeModal
        isOpen={!!m.editingGT}
        onClose={m.closeEditModal}
        submitting={m.editSubmitting}
        onSubmit={m.handleEditSubmit}
        name={m.editName}
        setName={m.setEditName}
        mode="edit"
      />
    </div>
  );
}
