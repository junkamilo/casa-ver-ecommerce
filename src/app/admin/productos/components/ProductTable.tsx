import Image from "next/image";
import { Edit2, Trash2, Loader2 } from "lucide-react";
import { ProductListItem } from "../types";
import { formatPrice, getStockStatus } from "../constants";
import ProductMobileList from "./ProductMobileList";

interface Props {
  products: ProductListItem[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export default function ProductTable({
  products,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop */}
      <table className="w-full hidden md:table">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            {["Producto", "Categoría", "Precio", "Stock", "Estado", "Acciones"].map(
              (h, i) => (
                <th
                  key={h}
                  className={`px-6 py-4 text-xs font-bold text-gray-500 uppercase ${
                    i === 5 ? "text-right" : "text-left"
                  }`}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            const mainImage = product.images[0]?.url || "/placeholder.jpg";
            return (
              <tr
                key={product.id}
                className="hover:bg-gray-50/60 transition-colors group"
              >
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
                <td className="px-6 py-4 font-medium text-gray-900">
                  {formatPrice(product.price)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${stockStatus.color}`}
                  >
                    {stockStatus.label} ({product.stock})
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onToggleActive(product.id, product.active)}
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
                      onClick={() => onEdit(product.id)}
                      className="p-2 text-gray-400 hover:text-[#C19A6B] bg-gray-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
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

      {/* Mobile */}
      <ProductMobileList products={products} onEdit={onEdit} onDelete={onDelete} />

      {products.length === 0 && (
        <div className="py-12 text-center text-gray-400">
          <p>No se encontraron productos</p>
        </div>
      )}
    </div>
  );
}
