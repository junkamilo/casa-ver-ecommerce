"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ToastState } from "./types";
import { useProductList } from "./hooks/useProductList";
import { useProductForm } from "./hooks/useProductForm";
import ToastNotification from "./components/ToastNotification";
import ProductFilters from "./components/ProductFilters";
import ProductTable from "./components/ProductTable";
import AdminPagination from "@/components/ui/AdminPagination";
import ProductModal from "./components/ProductModal";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { Plus } from "lucide-react";
import {
  AdminProductsApiError,
  createAdminProduct,
  fetchAdminProductById,
  updateAdminProduct,
} from "@/modules/adminCatalog/products/presentation/api-client";

export default function AdminProductos() {
  const router = useRouter();
  const list = useProductList();
  const form = useProductForm();

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const openNew = () => {
    form.reset();
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = async (productId: string) => {
    form.reset();
    setEditingId(productId);
    setFormLoading(true);
    setShowModal(true);
    try {
      const data = await fetchAdminProductById(productId);
      form.loadFromProduct(data, list.presetColors);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "No se pudo cargar el producto";
      showToast("error", message);
      setShowModal(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missingRequired = !form.name || !form.categoryId || (!form.isSet && !form.basePrice);
    if (missingRequired) {
      showToast("error", form.isSet ? "Completa nombre y categoría" : "Completa nombre, precio y categoría");
      return;
    }
    // Para isSet=true los colores/tallas viven en las subcategorías, no en el padre
    if (!form.isSet && form.selectedColors.length === 0) {
      showToast("error", "Debes seleccionar al menos 1 color para el producto");
      return;
    }
    if (!form.isSet && form.selectedSizes.length === 0) {
      showToast("error", "Debes seleccionar al menos 1 talla para el producto");
      return;
    }
    setSubmitting(true);
    try {
      const payload = form.buildPayload();
      if (editingId) {
        await updateAdminProduct(editingId, payload);
      } else {
        await createAdminProduct(payload);
      }
      showToast("success", editingId ? "Producto actualizado" : "Producto creado");
      setShowModal(false);
      router.refresh();
      await list.fetchProducts();
    } catch (err: unknown) {
      const msg =
        err instanceof AdminProductsApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Error al guardar el producto";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    const ok = await list.deleteProduct(id);
    showToast(ok ? "success" : "error", ok ? "Producto eliminado" : "No se pudo eliminar");
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen font-sans">
      <ToastNotification toast={toast} />

      <AdminPageHeader
        title="Inventario"
        action={{ label: "Nuevo Producto", onClick: openNew, icon: Plus }}
      />

      {list.fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          {list.fetchError}
        </div>
      )}

      <ProductFilters
        search={list.search}
        onSearchChange={list.setSearch}
        filterCategory={list.filterCategory}
        onCategoryChange={list.setFilterCategory}
        categories={list.categories}
      />

      <ProductTable
        products={list.paginatedProducts}
        loading={list.loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggleActive={list.toggleActive}
      />

      <AdminPagination
        page={list.page}
        totalPages={list.totalPages}
        onPageChange={list.setPage}
        total={list.filteredProducts.length}
        pageSize={list.pageSize}
        onPageSizeChange={list.setPageSize}
        itemLabel="productos"
      />

      {showModal && (
        <ProductModal
          editingId={editingId}
          formLoading={formLoading}
          submitting={submitting}
          categories={list.categories}
          presetColors={list.presetColors}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          {...form}
        />
      )}
    </div>
  );
}
