import { Trash2 } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import { ColorForm, VariantForm } from "../../types";
import { SIZES } from "../../constants";

interface Props {
  color: ColorForm;
  disabled: boolean;
  onUpdate: (tempId: string, field: keyof ColorForm, value: string | string[]) => void;
  onRemove: (tempId: string) => void;
  onAddImage: (tempId: string, url: string) => void;
  onRemoveImage: (tempId: string, url: string) => void;
  onUpdateVariant: (tempId: string, size: string, field: keyof VariantForm, value: string) => void;
}

export default function ColorCard({
  color,
  disabled,
  onUpdate,
  onRemove,
  onAddImage,
  onRemoveImage,
  onUpdateVariant,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
        <input
          type="color"
          value={color.hexCode}
          onChange={(e) => onUpdate(color.tempId, "hexCode", e.target.value)}
          className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer p-0.5"
        />
        <input
          type="text"
          value={color.name}
          onChange={(e) => onUpdate(color.tempId, "name", e.target.value)}
          placeholder="Nombre del color (ej: Verde Militar)"
          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-[#C19A6B] outline-none"
        />
        <span className="text-xs text-gray-400 font-mono">{color.hexCode}</span>
        <button
          type="button"
          onClick={() => onRemove(color.tempId)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Images */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
            Imágenes de este color
          </label>
          <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
            <ImageUpload
              value={color.images}
              disabled={disabled}
              onChange={(url) => onAddImage(color.tempId, url)}
              onRemove={(url) => onRemoveImage(color.tempId, url)}
              maxImages={5}
            />
          </div>
        </div>

        {/* Sizes & stock */}
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
                  onChange={(e) => onUpdateVariant(color.tempId, size, "stock", e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-16 px-2 py-1 text-sm text-center rounded border border-gray-200 focus:border-[#C19A6B] outline-none"
                />
                <input
                  type="number"
                  value={color.variants[size]?.priceOverride || ""}
                  onChange={(e) =>
                    onUpdateVariant(color.tempId, size, "priceOverride", e.target.value)
                  }
                  placeholder="Precio+"
                  min="0"
                  className="w-20 px-2 py-1 text-sm rounded border border-gray-200 focus:border-[#C19A6B] outline-none text-gray-400 placeholder:text-gray-300"
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            Solo se crean variantes con stock mayor a 0. &quot;Precio+&quot; es opcional (sobreprecio
            por talla).
          </p>
        </div>
      </div>
    </div>
  );
}
