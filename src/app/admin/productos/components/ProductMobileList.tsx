import Image from "next/image";
import { Edit2, Trash2, Video } from "lucide-react";
import { ProductMobileListProps } from "../types";
import { formatPrice, getStockStatus } from "../constants";
import SectionEmptyState from "@/components/ui/SectionEmptyState";

export default function ProductMobileList({ products, onEdit, onDelete, onToggleActive }: ProductMobileListProps) {
  if (products.length === 0) {
    return (
      <div className="md:hidden">
        <SectionEmptyState message="No se encontraron productos." />
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-2 p-3">
      {products.map((product) => {
        const stockStatus = getStockStatus(product.stock);
        const rawImage = product.images[0]?.url ?? null;
        const rawImageIsVideo = rawImage
          ? rawImage.includes('/video/upload/') || /\.(mp4|webm|mov|avi)(\?|$)/i.test(rawImage)
          : false;
        const mainImage = rawImage && !rawImageIsVideo ? rawImage : null;
        const hasVideo = !mainImage && (!!product.videoUrl || rawImageIsVideo);
        const isSetWithItems = product.isSet && product.setItems && product.setItems.length > 0;

        return (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 p-4 active:scale-[0.99] transition-transform"
          >
            {/* Imagen */}
            <div className="w-24 h-24 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden relative shrink-0 flex items-center justify-center">
              {mainImage ? (
                <Image src={mainImage} alt={product.name} fill className="object-cover" />
              ) : hasVideo ? (
                <Video className="w-8 h-8 text-gray-400" />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-gray-900 truncate leading-tight">
                {product.name}
              </p>
              <p className="text-base font-bold text-[#154734] mt-1">
                {formatPrice(product.price)}
              </p>
              {isSetWithItems ? (
                <div className="flex flex-col gap-1 mt-2">
                  {product.setItems!.map((item) => {
                    const s = getStockStatus(item.stock);
                    return (
                      <span
                        key={item.name}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.color}`}
                      >
                        {item.name} ({item.stock})
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span
                  className={`inline-flex items-center mt-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${stockStatus.color}`}
                >
                  {stockStatus.label} ({product.stock})
                </span>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <button
                onClick={() => onToggleActive(product.id, product.active)}
                className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors duration-200 ${
                  product.active ? "bg-[#154734]" : "bg-gray-200"
                }`}
                title={product.active ? "Desactivar" : "Activar"}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    product.active ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>

              <button
                onClick={() => onEdit(product.id)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#C19A6B]/10 text-[#C19A6B] active:scale-90 transition-transform"
                title="Editar producto"
              >
                <Edit2 className="w-5 h-5" />
              </button>

              <button
                onClick={() => onDelete(product.id)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-400 active:scale-90 transition-transform"
                title="Eliminar producto"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
