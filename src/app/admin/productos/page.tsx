"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  EyeOff,
  Trash2,
  Filter,
  Upload,
  X,
  ImagePlus,
  Save,
} from "lucide-react";

// Data genérica
const initialProducts = [
  { id: "1", name: "Enterizo Corto Tropical", price: 89000, stock: 15, active: true, image: "/placeholder-product.jpg", category: "Enterizos" },
  { id: "2", name: "Set Short Deportivo", price: 125000, stock: 8, active: true, image: "/placeholder-product.jpg", category: "Sets" },
  { id: "3", name: "Body Sport Premium", price: 65000, stock: 0, active: false, image: "/placeholder-product.jpg", category: "Bodys" },
  { id: "4", name: "Chaqueta Nylon Premium", price: 185000, stock: 22, active: true, image: "/placeholder-product.jpg", category: "Chaquetas" },
  { id: "5", name: "Set Pant Elegante", price: 145000, stock: 5, active: true, image: "/placeholder-product.jpg", category: "Sets" },
  { id: "6", name: "Enterizo Largo Casual", price: 110000, stock: 12, active: true, image: "/placeholder-product.jpg", category: "Enterizos" },
  { id: "7", name: "Balaca Deportiva", price: 25000, stock: 40, active: false, image: "/placeholder-product.jpg", category: "Accesorios" },
  { id: "8", name: "Bolso Gym Essential", price: 78000, stock: 18, active: true, image: "/placeholder-product.jpg", category: "Accesorios" },
];

export default function AdminProductos() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<typeof initialProducts[0] | null>(null);

  const categories = ["Todos", ...Array.from(new Set(initialProducts.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "Todos" || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const toggleActive = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  const openNew = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const openEdit = (product: typeof initialProducts[0]) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} productos en total</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-[#154734] text-white px-4 py-2.5 rounded-lg hover:bg-[#1a5c43] transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 focus:border-[#154734]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 bg-white"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table (Desktop) */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
              <th className="px-5 py-3">Producto</th>
              <th className="px-5 py-3">Categoría</th>
              <th className="px-5 py-3">Precio</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <ImagePlus className="w-5 h-5 text-gray-300" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{product.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{product.category}</td>
                <td className="px-5 py-3 text-sm font-semibold text-gray-900">{formatPrice(product.price)}</td>
                <td className="px-5 py-3">
                  <span className={`text-sm font-medium ${product.stock === 0 ? "text-red-500" : product.stock < 10 ? "text-amber-500" : "text-gray-900"}`}>
                    {product.stock === 0 ? "Agotado" : product.stock}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleActive(product.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                      product.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {product.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {product.active ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="p-2 text-gray-400 hover:text-[#154734] hover:bg-[#154734]/5 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Products Cards (Mobile) */}
      <div className="md:hidden space-y-3">
        {filtered.map((product) => (
          <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <ImagePlus className="w-6 h-6 text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="text-xs text-gray-500">{product.category}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
                  <span className={`text-xs ${product.stock === 0 ? "text-red-500" : "text-gray-500"}`}>
                    Stock: {product.stock === 0 ? "Agotado" : product.stock}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => toggleActive(product.id)}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  product.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {product.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {product.active ? "Activo" : "Inactivo"}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(product)}
                  className="p-2 text-gray-400 hover:text-[#154734] rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear/Editar Producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  defaultValue={editingProduct?.name || ""}
                  placeholder="Nombre del producto"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 focus:border-[#154734]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (COP)</label>
                  <input
                    type="number"
                    defaultValue={editingProduct?.price || ""}
                    placeholder="89000"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 focus:border-[#154734]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    defaultValue={editingProduct?.stock || ""}
                    placeholder="10"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 focus:border-[#154734]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 bg-white">
                  <option>Enterizos</option>
                  <option>Sets</option>
                  <option>Bodys</option>
                  <option>Chaquetas</option>
                  <option>Accesorios</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  placeholder="Descripción del producto..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 focus:border-[#154734] resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-[#154734]/30 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Arrastra imágenes o haz clic para subir</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG hasta 5MB</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 bg-[#154734] text-white rounded-lg text-sm font-medium hover:bg-[#1a5c43] transition-colors inline-flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingProduct ? "Guardar Cambios" : "Crear Producto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
