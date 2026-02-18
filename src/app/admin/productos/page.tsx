"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  X,
  Save,
  Package,
  Loader2,
  CheckCircle,
  AlertCircle,
  Palette,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";

// ─── Tipos ────────────────────────────────────────────
interface ProductListItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: { name: string };
  active: boolean;
  images: { url: string }[];
  description?: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "ONESIZE"] as const;

interface VariantForm {
  stock: string;
  priceOverride: string;
}

interface ColorForm {
  tempId: string;
  name: string;
  hexCode: string;
  images: string[];
  variants: Record<string, VariantForm>;
}

const newColorForm = (): ColorForm => ({
  tempId: crypto.randomUUID(),
  name: "",
  hexCode: "#000000",
  images: [],
  variants: Object.fromEntries(
    SIZES.map((s) => [s, { stock: "", priceOverride: "" }])
  ),
});

// ─── Componente Principal ─────────────────────────────
export default function AdminProductos() {
  // --- Estados de lista ---
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todos");

  // --- Modal ---
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Campos del formulario ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [material, setMaterial] = useState("");
  const [careInfo, setCareInfo] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [generalImages, setGeneralImages] = useState<string[]>([]);
  const [colors, setColors] = useState<ColorForm[]>([]);

  // --- Secciones colapsables ---
  const [showSEO, setShowSEO] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);

  // --- Toast ---
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ─── Fetch ──────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch {
      showToast("error", "Error al cargar inventario");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      console.error("Error al cargar categorías");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // ─── Filtros ────────────────────────────────────────
  useEffect(() => {
    let result = products;
    if (search) {
      result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (filterCategory !== "Todos") {
      result = result.filter((p) => p.category?.name === filterCategory);
    }
    setFilteredProducts(result);
  }, [search, filterCategory, products]);

  // ─── Helpers ────────────────────────────────────────
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setBasePrice("");
    setComparePrice("");
    setCategoryId("");
    setStatus("ACTIVE");
    setIsFeatured(false);
    setIsNew(false);
    setMaterial("");
    setCareInfo("");
    setMetaTitle("");
    setMetaDescription("");
    setGeneralImages([]);
    setColors([]);
    setShowSEO(false);
    setShowMaterial(false);
  };

  const openNew = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = async (productId: string) => {
    resetForm();
    setEditingId(productId);
    setFormLoading(true);
    setShowModal(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      setName(data.name);
      setDescription(data.description || "");
      setBasePrice(data.basePrice?.toString() || "");
      setComparePrice(data.comparePrice?.toString() || "");
      setCategoryId(data.categoryId);
      setStatus(data.status);
      setIsFeatured(data.isFeatured);
      setIsNew(data.isNew);
      setMaterial(data.material || "");
      setCareInfo(data.careInfo || "");
      setMetaTitle(data.metaTitle || "");
      setMetaDescription(data.metaDescription || "");
      setGeneralImages(data.generalImages || []);

      if (data.material || data.careInfo) setShowMaterial(true);
      if (data.metaTitle || data.metaDescription) setShowSEO(true);

      setColors(
        data.colors.map((c: any) => ({
          tempId: c.id || crypto.randomUUID(),
          name: c.name,
          hexCode: c.hexCode,
          images: c.images || [],
          variants: Object.fromEntries(
            SIZES.map((s) => {
              const v = c.variants.find((vr: any) => vr.size === s);
              return [
                s,
                {
                  stock: v ? v.stock.toString() : "",
                  priceOverride: v?.priceOverride ? v.priceOverride.toString() : "",
                },
              ];
            })
          ),
        }))
      );
    } catch {
      showToast("error", "No se pudo cargar el producto");
      setShowModal(false);
    } finally {
      setFormLoading(false);
    }
  };

  // ─── Submit ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !basePrice || !categoryId) {
      showToast("error", "Completa nombre, precio y categoría");
      return;
    }
    setSubmitting(true);

    const payload = {
      name,
      description,
      basePrice: parseFloat(basePrice),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      categoryId,
      status,
      isFeatured,
      isNew,
      material,
      careInfo,
      metaTitle,
      metaDescription,
      generalImages,
      colors: colors
        .filter((c) => c.name.trim())
        .map((c) => ({
          name: c.name.trim(),
          hexCode: c.hexCode,
          images: c.images,
          variants: Object.entries(c.variants)
            .filter(([, v]) => v.stock && parseInt(v.stock) > 0)
            .map(([size, v]) => ({
              size,
              stock: parseInt(v.stock),
              priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : null,
            })),
        })),
    };

    try {
      const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      showToast("success", editingId ? "Producto actualizado" : "Producto creado");
      setShowModal(false);
      fetchProducts();
    } catch {
      showToast("error", "Error al guardar el producto");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("success", "Producto eliminado");
        fetchProducts();
      } else throw new Error();
    } catch {
      showToast("error", "No se pudo eliminar");
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !currentState } : p)));
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentState }),
      });
    } catch {
      showToast("error", "No se pudo cambiar el estado");
      fetchProducts();
    }
  };

  // ─── Color helpers ──────────────────────────────────
  const addColor = () => setColors((prev) => [...prev, newColorForm()]);

  const removeColor = (tempId: string) =>
    setColors((prev) => prev.filter((c) => c.tempId !== tempId));

  const updateColor = (tempId: string, field: keyof ColorForm, value: any) =>
    setColors((prev) => prev.map((c) => (c.tempId === tempId ? { ...c, [field]: value } : c)));

  const addColorImage = (tempId: string, url: string) =>
    setColors((prev) =>
      prev.map((c) => (c.tempId === tempId ? { ...c, images: [...c.images, url] } : c))
    );

  const removeColorImage = (tempId: string, url: string) =>
    setColors((prev) =>
      prev.map((c) =>
        c.tempId === tempId ? { ...c, images: c.images.filter((i) => i !== url) } : c
      )
    );

  const updateVariant = (tempId: string, size: string, field: keyof VariantForm, value: string) =>
    setColors((prev) =>
      prev.map((c) =>
        c.tempId === tempId
          ? {
              ...c,
              variants: {
                ...c.variants,
                [size]: { ...c.variants[size], [field]: value },
              },
            }
          : c
      )
    );

  // ─── Format helpers ─────────────────────────────────
  const formatPrice = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(val);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Agotado", color: "bg-red-100 text-red-700 border-red-200" };
    if (stock < 5) return { label: "Bajo Stock", color: "bg-amber-100 text-amber-700 border-amber-200" };
    return { label: "En Stock", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  };

  // ═══════════════════════════════════════════════════════
  // JSX
  // ═══════════════════════════════════════════════════════
  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen font-sans">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-top duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#154734]" style={{ fontFamily: "Georgia, serif" }}>
            Inventario
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
            <Package className="w-4 h-4" />
            Gestión completa de catálogo
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 bg-[#154734] hover:bg-[#0f3626] text-white px-6 py-3 rounded-full transition-all shadow-lg hover:shadow-xl active:scale-95 font-medium"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#C19A6B]/10 transition-all"
          />
        </div>
        <div className="relative w-full md:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 bg-white appearance-none cursor-pointer hover:border-[#154734]"
          >
            <option>Todos</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop table */}
          <table className="w-full hidden md:table">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Precio</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                const mainImage = product.images[0]?.url || "/placeholder.jpg";
                return (
                  <tr key={product.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative shrink-0">
                          <Image src={mainImage} alt={product.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">ID: {product.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.category?.name || "Sin categoría"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${stockStatus.color}`}>
                        {stockStatus.label} ({product.stock})
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(product.id, product.active)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          product.active ? "bg-[#154734]" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            product.active ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(product.id)}
                          className="p-2 text-gray-400 hover:text-[#C19A6B] bg-gray-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              const mainImage = product.images[0]?.url || "/placeholder.jpg";
              return (
                <div key={product.id} className="p-4 flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 border overflow-hidden relative shrink-0">
                    <Image src={mainImage} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${stockStatus.color}`}>
                        {stockStatus.label} ({product.stock})
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => openEdit(product.id)} className="p-2 text-gray-400 hover:text-[#C19A6B]">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <p>No se encontraron productos</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* MODAL CREAR / EDITAR                               */}
      {/* ═══════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />

          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-[#154734]" style={{ fontFamily: "Georgia, serif" }}>
                {editingId ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            {formLoading ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#154734]" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-8">
                  {/* ──── INFORMACIÓN GENERAL ──── */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide">
                      Información General
                    </h3>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Nombre del Producto *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Enterizo Tropical"
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Descripción *</label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe el producto..."
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Precio Base (COP) *</label>
                        <input
                          type="number"
                          value={basePrice}
                          onChange={(e) => setBasePrice(e.target.value)}
                          placeholder="89900"
                          required
                          min="0"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Precio Antes (tachado)</label>
                        <input
                          type="number"
                          value={comparePrice}
                          onChange={(e) => setComparePrice(e.target.value)}
                          placeholder="120000"
                          min="0"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Categoría *</label>
                        <select
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] bg-white outline-none"
                        >
                          <option value="">Seleccionar...</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Estado</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] bg-white outline-none"
                        >
                          <option value="ACTIVE">Activo</option>
                          <option value="INACTIVE">Inactivo</option>
                          <option value="DRAFT">Borrador</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#154734] focus:ring-[#154734]"
                        />
                        <span className="text-sm text-gray-700">Producto Destacado</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isNew}
                          onChange={(e) => setIsNew(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#154734] focus:ring-[#154734]"
                        />
                        <span className="text-sm text-gray-700">Marcar como Nuevo</span>
                      </label>
                    </div>
                  </section>

                  {/* ──── IMÁGENES GENERALES ──── */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide">
                      Imágenes Generales
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                      <ImageUpload
                        value={generalImages}
                        disabled={submitting}
                        onChange={(url) => setGeneralImages((prev) => [...prev, url])}
                        onRemove={(url) => setGeneralImages((prev) => prev.filter((i) => i !== url))}
                        maxImages={5}
                      />
                    </div>
                  </section>

                  {/* ──── COLORES Y VARIANTES ──── */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide">
                        Colores, Tallas y Stock
                      </h3>
                      <button
                        type="button"
                        onClick={addColor}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#154734] hover:text-[#0f3626] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar Color
                      </button>
                    </div>

                    {colors.length === 0 && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm">
                        <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Agrega al menos un color para definir tallas y stock</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {colors.map((color) => (
                        <div
                          key={color.tempId}
                          className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                        >
                          {/* Color header */}
                          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                            <input
                              type="color"
                              value={color.hexCode}
                              onChange={(e) => updateColor(color.tempId, "hexCode", e.target.value)}
                              className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                            />
                            <input
                              type="text"
                              value={color.name}
                              onChange={(e) => updateColor(color.tempId, "name", e.target.value)}
                              placeholder="Nombre del color (ej: Verde Militar)"
                              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-[#C19A6B] outline-none"
                            />
                            <span className="text-xs text-gray-400 font-mono">{color.hexCode}</span>
                            <button
                              type="button"
                              onClick={() => removeColor(color.tempId)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="p-4 space-y-4">
                            {/* Imágenes del color */}
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                                Imágenes de este color
                              </label>
                              <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
                                <ImageUpload
                                  value={color.images}
                                  disabled={submitting}
                                  onChange={(url) => addColorImage(color.tempId, url)}
                                  onRemove={(url) => removeColorImage(color.tempId, url)}
                                  maxImages={5}
                                />
                              </div>
                            </div>

                            {/* Tallas y stock */}
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                                Tallas y Stock
                              </label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {SIZES.map((size) => (
                                  <div key={size} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                    <span className="text-xs font-bold text-gray-600 w-14">{size}</span>
                                    <input
                                      type="number"
                                      value={color.variants[size]?.stock || ""}
                                      onChange={(e) => updateVariant(color.tempId, size, "stock", e.target.value)}
                                      placeholder="0"
                                      min="0"
                                      className="w-16 px-2 py-1 text-sm text-center rounded border border-gray-200 focus:border-[#C19A6B] outline-none"
                                    />
                                    <input
                                      type="number"
                                      value={color.variants[size]?.priceOverride || ""}
                                      onChange={(e) => updateVariant(color.tempId, size, "priceOverride", e.target.value)}
                                      placeholder="Precio+"
                                      min="0"
                                      className="w-20 px-2 py-1 text-sm rounded border border-gray-200 focus:border-[#C19A6B] outline-none text-gray-400 placeholder:text-gray-300"
                                    />
                                  </div>
                                ))}
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1">
                                Solo se crean variantes con stock mayor a 0. &quot;Precio+&quot; es opcional (sobreprecio por talla).
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* ──── MATERIAL Y CUIDADO (colapsable) ──── */}
                  <section>
                    <button
                      type="button"
                      onClick={() => setShowMaterial(!showMaterial)}
                      className="flex items-center gap-2 text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide w-full text-left"
                    >
                      Material y Cuidado
                      {showMaterial ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showMaterial && (
                      <div className="mt-4 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Material</label>
                          <input
                            type="text"
                            value={material}
                            onChange={(e) => setMaterial(e.target.value)}
                            placeholder="Ej: 100% Algodón Orgánico"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Instrucciones de Cuidado</label>
                          <textarea
                            rows={3}
                            value={careInfo}
                            onChange={(e) => setCareInfo(e.target.value)}
                            placeholder="Ej: Lavar a mano con agua fría. No usar secadora."
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] outline-none resize-none"
                          />
                        </div>
                      </div>
                    )}
                  </section>

                  {/* ──── SEO (colapsable) ──── */}
                  <section>
                    <button
                      type="button"
                      onClick={() => setShowSEO(!showSEO)}
                      className="flex items-center gap-2 text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide w-full text-left"
                    >
                      SEO (Posicionamiento)
                      {showSEO ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showSEO && (
                      <div className="mt-4 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Meta Título</label>
                          <input
                            type="text"
                            value={metaTitle}
                            onChange={(e) => setMetaTitle(e.target.value)}
                            placeholder="Título para buscadores (max 60 caracteres)"
                            maxLength={60}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Meta Descripción</label>
                          <textarea
                            rows={2}
                            value={metaDescription}
                            onChange={(e) => setMetaDescription(e.target.value)}
                            placeholder="Descripción para buscadores (max 160 caracteres)"
                            maxLength={160}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] outline-none resize-none"
                          />
                        </div>
                      </div>
                    )}
                  </section>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 text-sm font-bold text-white bg-[#154734] hover:bg-[#103a2a] rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingId ? "Guardar Cambios" : "Crear Producto"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
