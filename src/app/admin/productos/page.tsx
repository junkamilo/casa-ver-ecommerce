"use client";

import { useState, useCallback } from "react";
import { ToastState } from "./types";
import { useProductList } from "./hooks/useProductList";
import { useProductForm } from "./hooks/useProductForm";
import ToastNotification from "./components/ToastNotification";
import ProductsHeader from "./components/ProductsHeader";
import ProductFilters from "./components/ProductFilters";
import ProductTable from "./components/ProductTable";
import ProductModal from "./components/ProductModal";

export default function AdminProductos() {
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
      const res = await fetch(`/api/admin/products/${productId}`);
      if (!res.ok) throw new Error();
      form.loadFromProduct(await res.json());
    } catch {
      showToast("error", "No se pudo cargar el producto");
      setShowModal(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.basePrice || !form.categoryId) {
      showToast("error", "Completa nombre, precio y categoría");
      return;
    }
    setSubmitting(true);
    try {
      const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form.buildPayload()),
      });
      if (!res.ok) throw new Error();
      showToast("success", editingId ? "Producto actualizado" : "Producto creado");
      setShowModal(false);
      list.fetchProducts();
    } catch {
      showToast("error", "Error al guardar el producto");
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

      <ProductsHeader onNew={openNew} />

      <ProductFilters
        search={list.search}
        onSearchChange={list.setSearch}
        filterCategory={list.filterCategory}
        onCategoryChange={list.setFilterCategory}
        categories={list.categories}
      />

      <ProductTable
        products={list.filteredProducts}
        loading={list.loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggleActive={list.toggleActive}
      />

      {showModal && (
        <ProductModal
          editingId={editingId}
          formLoading={formLoading}
          submitting={submitting}
          categories={list.categories}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          {...form}
        />
      )}
    </div>
  );
}
