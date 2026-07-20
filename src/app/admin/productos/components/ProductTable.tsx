import Image from "next/image";
import { Edit2, Trash2, Loader2, Video } from "lucide-react";
import { ProductTableProps } from "../types";
import { formatPrice, getStockStatus } from "../constants";
import ProductMobileList from "./ProductMobileList";
import SectionEmptyState from "@/components/ui/SectionEmptyState";

export default function ProductTable({
  products,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
}: ProductTableProps) {
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
      <div className="hidden md:block overflow-auto max-h-150">
      <table className="w-full">
        <thead>
          <tr className="bg-[#F8F9FA] border-b border-gray-200">
            {["Producto", "Categoría", "Precio", "Stock", "Estado", "Acciones"].map(
              (h, i) => (
                <th
                  key={h}
                  className={`sticky top-0 z-20 bg-[#F8F9FA] px-6 py-4 text-xs font-bold text-gray-500 uppercase shadow-[0_1px_0_0_rgba(229,231,235,1)] ${
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
            const rawImage = product.images[0]?.url ?? null;
            const rawImageIsVideo = rawImage
              ? rawImage.includes('/video/upload/') || /\.(mp4|webm|mov|avi|mkv|m4v)(\?|$)/i.test(rawImage)
              : false;
            const mainImage = rawImage && !rawImageIsVideo ? rawImage : null;
            const hasVideo = !mainImage && (!!product.videoUrl || rawImageIsVideo);
            const isSetWithItems = product.isSet && product.setItems && product.setItems.length > 0;
            return (
              <tr
                key={product.id}
                className="hover:bg-gray-50/60 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative shrink-0 flex items-center justify-center">
                      {mainImage ? (
                        <Image src={mainImage} alt={product.name} fill className="object-cover" />
                      ) : hasVideo ? (
                        <Video className="w-5 h-5 text-gray-400" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">ID: {product.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {product.categories.length > 0
                      ? product.categories.map((category) => category.name).join(", ")
                      : "Sin categoría"}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {isSetWithItems ? (
                    <div className="flex flex-col items-start gap-1">
                      {product.setItems!.map((item) => (
                        <span key={item.name} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-gray-200 bg-gray-50 text-gray-700">
                          {item.name} ({item.price != null ? formatPrice(item.price) : "—"})
                        </span>
                      ))}
                    </div>
                  ) : (
                    formatPrice(product.price)
                  )}
                </td>
                <td className="px-6 py-4">
                  {isSetWithItems ? (
                    <div className="flex flex-col items-start gap-1">
                      {product.setItems!.map((item) => {
                        const s = getStockStatus(item.stock);
                        return (
                          <span
                            key={item.name}
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${s.color}`}
                          >
                            {item.name} ({item.stock})
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${stockStatus.color}`}
                    >
                      {stockStatus.label} ({product.stock})
                    </span>
                  )}
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
                  <div className="flex justify-end gap-2">
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
      </div>

      {/* Mobile */}
      <ProductMobileList products={products} onEdit={onEdit} onDelete={onDelete} onToggleActive={onToggleActive} />

      {products.length === 0 && (
        <div className="hidden md:flex justify-center">
          <SectionEmptyState message="No se encontraron productos." />
        </div>
      )}
    </div>
  );
}
