"use client";

import { useCategoryManager } from "./hooks/useCategoryManager";
import CategoryToast from "./components/CategoryToast";
import CategoryPageHeader from "./components/CategoryPageHeader";
import CategorySearch from "./components/CategorySearch";
import CategoryGrid from "./components/CategoryGrid";
import CategoryModal from "./components/CategoryModal";

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
    description,
    setDescription,
    toast,
    handleSubmit,
    handleDelete,
  } = useCategoryManager();

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen font-sans">
      <CategoryToast toast={toast} />

      <CategoryPageHeader onNew={() => setShowModal(true)} />

      <CategorySearch value={search} onChange={setSearch} />

      <CategoryGrid loading={loading} filtered={filtered} onDelete={handleDelete} />

      <CategoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        submitting={submitting}
        onSubmit={handleSubmit}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
      />
    </div>
  );
}
