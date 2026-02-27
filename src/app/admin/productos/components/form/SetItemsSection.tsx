import { Plus, Trash2, ChevronDown, ChevronUp, Check, Video } from "lucide-react";
import { useState } from "react";
import { SetItemForm } from "../../types";
import { PRESET_COLORS, SIZES } from "../../constants";
import ImageUpload from "@/components/ui/image-upload";

interface Props {
  items: SetItemForm[];
  disabled: boolean;
  onAdd: () => void;
  onRemove: (localId: string) => void;
  onUpdate: (localId: string, updates: Partial<SetItemForm>) => void;
  onToggleColor: (localId: string, name: string, hexCode: string) => void;
  onToggleSize: (localId: string, size: string) => void;
  onSetColorImages: (localId: string, colorName: string, images: string[]) => void;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide">
    {children}
  </h3>
);

function SetItemCard({
  item,
  index,
  disabled,
  onRemove,
  onUpdate,
  onToggleColor,
  onToggleSize,
  onSetColorImages,
}: {
  item: SetItemForm;
  index: number;
  disabled: boolean;
  onRemove: (id: string) => void;
  onUpdate: (id: string, u: Partial<SetItemForm>) => void;
  onToggleColor: (id: string, name: string, hex: string) => void;
  onToggleSize: (id: string, size: string) => void;
  onSetColorImages: (id: string, colorName: string, images: string[]) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Header de la pieza */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-[#154734] text-white text-xs font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <input
            type="text"
            value={item.name}
            onChange={(e) => onUpdate(item.localId, { name: e.target.value })}
            placeholder="Nombre de la pieza (ej: Short)"
            disabled={disabled}
            className="text-sm font-semibold text-gray-800 bg-transparent border-none outline-none placeholder:text-gray-400 w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.localId)}
            disabled={disabled}
            className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-4">
          {/* Precio, Stock y Video */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Precio (COP)
              </label>
              <input
                type="number"
                value={item.price}
                onChange={(e) => onUpdate(item.localId, { price: e.target.value })}
                placeholder="89900"
                disabled={disabled}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154734]/20 focus:border-[#154734] disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Stock total
              </label>
              <input
                type="number"
                value={item.stock}
                onChange={(e) => onUpdate(item.localId, { stock: e.target.value })}
                placeholder="0"
                disabled={disabled}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154734]/20 focus:border-[#154734] disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              <Video className="w-3.5 h-3.5" /> URL de Video
            </label>
            <input
              type="url"
              value={item.videoUrl}
              onChange={(e) => onUpdate(item.localId, { videoUrl: e.target.value })}
              placeholder="https://..."
              disabled={disabled}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154734]/20 focus:border-[#154734] disabled:opacity-50"
            />
          </div>

          {/* Colores */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Colores</p>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((preset) => {
                  const selected = item.colors.some((c) => c.name === preset.name);
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => onToggleColor(item.localId, preset.name, preset.hex)}
                      disabled={disabled}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all ${
                        selected
                          ? "border-[#154734] bg-[#154734]/5 text-[#154734]"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                      } disabled:opacity-50`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 shrink-0"
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
            {item.colors.length > 0 && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 space-y-3">
                {item.colors.map((color) => (
                  <div key={color.name} className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      <span className="text-xs font-semibold text-gray-700">{color.name}</span>
                    </div>
                    <ImageUpload
                      value={color.images}
                      disabled={disabled}
                      onChange={(urls) =>
                        onSetColorImages(item.localId, color.name, [...color.images, ...urls])
                      }
                      onRemove={(url) =>
                        onSetColorImages(item.localId, color.name, color.images.filter((i) => i !== url))
                      }
                      maxImages={8}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tallas */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tallas</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => {
                const active = item.sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={disabled}
                    onClick={() => onToggleSize(item.localId, size)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      active
                        ? "bg-[#154734] text-white border-[#154734]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    } disabled:opacity-50`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SetItemsSection({
  items,
  disabled,
  onAdd,
  onRemove,
  onUpdate,
  onToggleColor,
  onToggleSize,
  onSetColorImages,
}: Props) {
  return (
    <section className="space-y-4">
      <SectionTitle>Piezas del Conjunto</SectionTitle>

      {items.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          Aún no hay piezas. Añade al menos una.
        </p>
      )}

      <div className="space-y-3">
        {items.map((item, i) => (
          <SetItemCard
            key={item.localId}
            item={item}
            index={i}
            disabled={disabled}
            onRemove={onRemove}
            onUpdate={onUpdate}
            onToggleColor={onToggleColor}
            onToggleSize={onToggleSize}
            onSetColorImages={onSetColorImages}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#C19A6B] text-[#C19A6B] rounded-xl text-sm font-semibold hover:bg-[#C19A6B]/5 transition-colors disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        Añadir pieza al conjunto
      </button>
    </section>
  );
}
