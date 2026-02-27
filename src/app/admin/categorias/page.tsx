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
    image,
    setImage,
    bannerImage,
    setBannerImage,
    toast,
    handleSubmit,
    editingCategory,
    editName,
    setEditName,
    editDescription,
    setEditDescription,
    editImage,
    setEditImage,
    editBannerImage,
    setEditBannerImage,
    editSubmitting,
    openEditModal,
    closeEditModal,
    handleEditSubmit,
    handleToggleActive,
  } = useCategoryManager();

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-[#C19A6B]/20">
      <CategoryToast toast={toast} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        
        <CategoryPageHeader onNew={() => setShowModal(true)} />

        <CategorySearch value={search} onChange={setSearch} />

        <CategoryGrid
          loading={loading}
          filtered={filtered}
          onEdit={openEditModal}
          onToggleActive={handleToggleActive}
        />

      </main>

      <CategoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        submitting={submitting}
        onSubmit={handleSubmit}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        image={image}
        setImage={setImage}
        bannerImage={bannerImage}
        setBannerImage={setBannerImage}
        mode="create"
      />

      <CategoryModal
        isOpen={!!editingCategory}
        onClose={closeEditModal}
        submitting={editSubmitting}
        onSubmit={handleEditSubmit}
        name={editName}
        setName={setEditName}
        description={editDescription}
        setDescription={setEditDescription}
        image={editImage}
        setImage={setEditImage}
        bannerImage={editBannerImage}
        setBannerImage={setEditBannerImage}
        mode="edit"
      />
    </div>
  );
}
