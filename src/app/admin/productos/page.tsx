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
  Package,
  MoreHorizontal,
  AlertCircle
} from "lucide-react";

// --- DATA SIMULADA ---
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

  // Función auxiliar para el color del stock
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Agotado", color: "bg-red-100 text-red-700 border-red-200" };
    if (stock < 10) return { label: "Bajo Stock", color: "bg-amber-100 text-amber-700 border-amber-200" };
    return { label: "En Stock", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-3 sm:p-6 bg-gray-50 min-h-screen font-sans">

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#154734]" style={{ fontFamily: 'Georgia, serif' }}>Inventario</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2 text-xs sm:text-sm">
            <Package className="w-4 h-4" />
            Gestión de productos y existencias
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 bg-[#154734] hover:bg-[#0f3626] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all shadow-lg hover:shadow-xl active:scale-95 font-medium text-sm sm:text-base"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      {/* --- FILTROS Y BÚSQUEDA --- */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">

        {/* Buscador */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#C19A6B]/10 transition-all"
          />
        </div>

        {/* Filtro Categoría */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 bg-white appearance-none cursor-pointer hover:border-[#154734]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* --- TABLA (DESKTOP) --- */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <tr key={product.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                        {/* Aquí iría el componente Image real */}
                        <ImagePlus className="w-5 h-5 text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{formatPrice(product.price)}</p>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col items-start gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${stockStatus.color}`}>
                            {stockStatus.label}
                        </span>
                        <span className="text-xs text-gray-500">{product.stock} unid.</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(product.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C19A6B] focus:ring-offset-2 ${
                        product.active ? "bg-[#154734]" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          product.active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="ml-2 text-xs text-gray-500">
                        {product.active ? "Visible" : "Oculto"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 text-gray-400 hover:text-[#C19A6B] hover:bg-orange-50 rounded-lg transition-colors"
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
              );
            })}
          </tbody>
        </table>
        
        {filtered.length === 0 && (
            <div className="p-12 text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No se encontraron productos</p>
            </div>
        )}
      </div>

      {/* --- MOBILE CARDS (Visible solo en móvil) --- */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {filtered.map((product) => (
          <div key={product.id} className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 relative">

            {/* Menú de acciones superior */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-2">
                <button onClick={() => openEdit(product)} className="p-1.5 bg-gray-50 text-gray-600 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                </button>
            </div>

            <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <ImagePlus className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                </div>
                <div className="min-w-0 pr-8">
                    <span className="text-[10px] sm:text-xs font-bold text-[#C19A6B] uppercase tracking-wide">{product.category}</span>
                    <h3 className="font-bold text-gray-900 leading-tight mb-1 text-sm sm:text-base truncate">{product.name}</h3>
                    <p className="text-base sm:text-lg font-semibold text-[#154734]">{formatPrice(product.price)}</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                     <span className="text-sm text-gray-600 font-medium">Stock: {product.stock}</span>
                </div>
                
                <button
                    onClick={() => toggleActive(product.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        product.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                >
                    {product.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {product.active ? "Visible" : "Oculto"}
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL (Responsive y Animado) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
          {/* Backdrop con Blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
          />

          {/* Contenido del Modal */}
          <div className="relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#154734]" style={{ fontFamily: 'Georgia, serif' }}>
                    {editingProduct ? "Editar Producto" : "Crear Nuevo Producto"}
                </h2>
                <p className="text-xs text-gray-500">Llena la información necesaria para el inventario</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
              
              {/* Sección Imágenes */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Imágenes del Producto</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#C19A6B] hover:bg-[#C19A6B]/5 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#C19A6B]" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Haz clic para subir o arrastra aquí</p>
                    <p className="text-xs text-gray-400 mt-1">Soporta: JPG, PNG, WEBP (Max 5MB)</p>
                </div>
              </div>

              {/* Formulario Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Nombre del Producto</label>
                    <input 
                        type="text" 
                        defaultValue={editingProduct?.name} 
                        placeholder="Ej: Set Deportivo Aura"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Precio (COP)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input 
                            type="number" 
                            defaultValue={editingProduct?.price} 
                            className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all"
                        />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Stock Disponible</label>
                    <input 
                        type="number" 
                        defaultValue={editingProduct?.stock} 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all"
                    />
                 </div>

                 <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Categoría</label>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all bg-white">
                        <option>Seleccionar...</option>
                        {categories.filter(c => c !== "Todos").map(c => (
                            <option key={c}>{c}</option>
                        ))}
                    </select>
                 </div>

                 <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Descripción</label>
                    <textarea 
                        rows={3} 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all resize-none"
                        placeholder="Detalles sobre materiales, cuidados, etc..."
                    />
                 </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end sticky bottom-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-white bg-[#154734] hover:bg-[#103a2a] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar Producto
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
