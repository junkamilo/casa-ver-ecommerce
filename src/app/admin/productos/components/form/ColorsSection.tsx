import { Check } from "lucide-react";
import { SelectedColor } from "../../types";
import { PRESET_COLORS, SIZES } from "../../constants";
import ImageUpload from "@/components/ui/image-upload";

interface Props {
  selectedColors: SelectedColor[];
  selectedSizes: string[];
  disabled: boolean;
  onToggleColor: (name: string, hexCode: string) => void;
  onToggleSize: (size: string) => void;
  onSetColorImages: (colorName: string, images: string[]) => void;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide">
    {children}
  </h3>
);

export default function ColorsSection({
  selectedColors,
  selectedSizes,
  disabled,
  onToggleColor,
  onToggleSize,
  onSetColorImages,
}: Props) {
  const isColorSelected = (name: string) =>
    selectedColors.some((c) => c.name === name);

  return (
    <section className="space-y-4">
      <SectionTitle>Colores y Tallas</SectionTitle>

      {/* Color picker */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Colores disponibles
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((preset) => {
            const selected = isColorSelected(preset.name);
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => onToggleColor(preset.name, preset.hex)}
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

      {/* Imágenes por color */}
      {selectedColors.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Imágenes por color
          </p>
          {selectedColors.map((color) => (
            <div key={color.name} className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: color.hexCode }}
                />
                <span className="text-sm font-semibold text-gray-700">{color.name}</span>
                <span className="text-xs text-gray-400 ml-1">
                  ({color.images.length} foto{color.images.length !== 1 ? "s" : ""})
                </span>
              </div>
              <ImageUpload
                value={color.images}
                disabled={disabled}
                onChange={(urls) => onSetColorImages(color.name, [...color.images, ...urls])}
                onRemove={(url) => onSetColorImages(color.name, color.images.filter((i) => i !== url))}
                maxImages={8}
              />
            </div>
          ))}
        </div>
      )}

      {/* Size picker */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Tallas disponibles
        </p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const active = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                disabled={disabled}
                onClick={() => onToggleSize(size)}
                className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                  active
                    ? "bg-[#154734] text-white border-[#154734]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
