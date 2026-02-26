import { Check, Palette } from "lucide-react";
import { ColorForm, VariantForm } from "../../types";
import { PRESET_COLORS } from "../../constants";
import ColorCard from "./ColorCard";

interface Props {
  colors: ColorForm[];
  disabled: boolean;
  onAdd: (name: string, hexCode: string) => void;
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
  onAddImage,
  onRemoveImage,
  onUpdateVariant,
}: Props) {
  const isSelected = (presetName: string) =>
    colors.some((c) => c.name === presetName);

  const toggle = (name: string, hex: string) => {
    if (disabled) return;
    const existing = colors.find((c) => c.name === name);
    if (existing) {
      onRemove(existing.tempId);
    } else {
      onAdd(name, hex);
    }
  };

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide">
        Colores, Tallas y Stock
      </h3>

      {/* Paleta de colores predefinidos */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
        <p className="text-xs text-gray-500 font-medium">
          Selecciona los colores que tiene esta prenda:
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((preset) => {
            const selected = isSelected(preset.name);
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => toggle(preset.name, preset.hex)}
                disabled={disabled}
                title={preset.name}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  selected
                    ? "border-[#154734] bg-[#154734]/5 text-[#154734]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: preset.hex }}
                />
                {preset.name}
                {selected && <Check className="w-3 h-3 text-[#154734]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Placeholder cuando no hay colores */}
      {colors.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm">
          <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Selecciona al menos un color para agregar tallas y stock</p>
        </div>
      )}

      {/* Cards de colores seleccionados */}
      <div className="space-y-4">
        {colors.map((color) => (
          <ColorCard
            key={color.tempId}
            color={color}
            disabled={disabled}
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
