import { Plus, Palette } from "lucide-react";
import { ColorForm, VariantForm } from "../../types";
import ColorCard from "./ColorCard";

interface Props {
  colors: ColorForm[];
  disabled: boolean;
  onAdd: () => void;
  onRemove: (tempId: string) => void;
  onUpdate: (tempId: string, field: keyof ColorForm, value: string | string[]) => void;
  onAddImage: (tempId: string, url: string) => void;
  onRemoveImage: (tempId: string, url: string) => void;
  onUpdateVariant: (tempId: string, size: string, field: keyof VariantForm, value: string) => void;
}

export default function ColorsSection({
  colors,
  disabled,
  onAdd,
  onRemove,
  onUpdate,
  onAddImage,
  onRemoveImage,
  onUpdateVariant,
}: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide">
          Colores, Tallas y Stock
        </h3>
        <button
          type="button"
          onClick={onAdd}
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
          <ColorCard
            key={color.tempId}
            color={color}
            disabled={disabled}
            onUpdate={onUpdate}
            onRemove={onRemove}
            onAddImage={onAddImage}
            onRemoveImage={onRemoveImage}
            onUpdateVariant={onUpdateVariant}
          />
        ))}
      </div>
    </section>
  );
}
