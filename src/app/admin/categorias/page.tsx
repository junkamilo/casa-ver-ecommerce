"use client";

import { useCategoryManager } from "./hooks/useCategoryManager";
import CategoryToast from "./components/CategoryToast";
import CategorySearch from "./components/CategorySearch";
import CategoryGrid from "./components/CategoryGrid";
import CategoryModal from "./components/CategoryModal";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { Plus } from "lucide-react";

export default function AdminCategorias() {
  const {
    filtered,
    loading,
    search,
    setSearch,
    showModal,
    setShowModal,
    submitting,
    name,
    setName,
    image,
    setImage,
    toast,
    handleSubmit,
    editingCategory,
    editName,
    setEditName,
    editImage,
    setEditImage,
    editSubmitting,
    openEditModal,
    closeEditModal,
    handleEditSubmit,
    handleToggleActive,
    handleReorder,
  } = useCategoryManager();

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-[#C19A6B]/20">
      <CategoryToast toast={toast} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">

        <AdminPageHeader
          title="Gestion De Categorias"
          action={{ label: "Nueva Categoria", onClick: () => setShowModal(true), icon: Plus }}
        />

        <CategorySearch value={search} onChange={setSearch} />

        <CategoryGrid
          loading={loading}
          filtered={filtered}
          canReorder={!search}
          onEdit={openEditModal}
          onToggleActive={handleToggleActive}
          onMoveUp={(cat) => handleReorder(cat, "up")}
          onMoveDown={(cat) => handleReorder(cat, "down")}
        />

      </main>

      <CategoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        submitting={submitting}
        onSubmit={handleSubmit}
        name={name}
        setName={setName}
        image={image}
        setImage={setImage}
        mode="create"
      />

      <CategoryModal
        isOpen={!!editingCategory}
        onClose={closeEditModal}
        submitting={editSubmitting}
        onSubmit={handleEditSubmit}
        name={editName}
        setName={setEditName}
        image={editImage}
        setImage={setEditImage}
        mode="edit"
      />
    </div>
  );
}
