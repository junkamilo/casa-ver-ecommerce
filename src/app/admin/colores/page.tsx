"use client";

import { useColorManager } from "./hooks/useColorManager";
import ColorList from "./components/ColorList";
import ColorModal from "./components/ColorModal";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import AdminPagination from "@/components/ui/AdminPagination";
import AdminToast from "@/app/admin/components/AdminToast";
import { Plus, Search } from "lucide-react";

export default function AdminColores() {
  const m = useColorManager();

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen font-sans">
      <AdminToast toast={m.toast} />

      <AdminPageHeader
        title="Colores"
        action={{ label: "Nuevo Color", onClick: () => m.setShowModal(true), icon: Plus }}
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nombre o código hex..."
          value={m.search}
          onChange={(e) => m.setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20 transition-all"
        />
      </div>

      <ColorList
        loading={m.loading}
        colors={m.paginatedColors}
        onEdit={m.openEditModal}
        onToggleActive={m.handleToggleActive}
        onDelete={m.handleDelete}
      />

      <AdminPagination
        page={m.page}
        totalPages={m.totalPages}
        onPageChange={m.setPage}
        total={m.filteredColors.length}
        pageSize={m.pageSize}
        onPageSizeChange={m.setPageSize}
        itemLabel="colores"
      />

      {/* Modal Crear */}
      <ColorModal
        isOpen={m.showModal}
        onClose={() => { m.setShowModal(false); m.setName(""); m.setHexCode("#000000"); }}
        submitting={m.submitting}
        onSubmit={m.handleSubmit}
        name={m.name}
        setName={m.setName}
        hexCode={m.hexCode}
        setHexCode={m.setHexCode}
        mode="create"
      />

      {/* Modal Editar */}
      <ColorModal
        isOpen={!!m.editingColor}
        onClose={m.closeEditModal}
        submitting={m.editSubmitting}
        onSubmit={m.handleEditSubmit}
        name={m.editName}
        setName={m.setEditName}
        hexCode={m.editHexCode}
        setHexCode={m.setEditHexCode}
        mode="edit"
      />
    </div>
  );
}
