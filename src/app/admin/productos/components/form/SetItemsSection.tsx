import { Plus, Trash2, ChevronDown, ChevronUp, Check, DollarSign, Package, Video, FileText } from "lucide-react";
import { useState } from "react";
import { SetItemForm } from "../../types";
import { PRESET_COLORS, SIZES } from "../../constants";
import { ItemFormErrors, SingleItemFormErrors } from "../../schema";
import ImageUpload from "@/components/ui/image-upload";
import VideoUpload from "@/components/ui/video-upload";

interface Props {
  items: SetItemForm[];
  disabled: boolean;
  itemErrors?: ItemFormErrors;
  onAdd: () => void;
  onRemove: (localId: string) => void;
  onUpdate: (localId: string, updates: Partial<SetItemForm>) => void;
  onToggleColor: (localId: string, name: string, hexCode: string) => void;
  onToggleSize: (localId: string, size: string) => void;
  onSetColorImages: (localId: string, colorName: string, images: string[]) => void;
}

const fieldCls = (hasError = false) =>
  `w-full px-3 py-2.5 text-sm border ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#154734] focus:ring-[#154734]/20"
  } rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 bg-white transition-colors`;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-500 text-sm mt-1">{msg}</p>;
}

function SetItemCard({
  item,
  index,
  disabled,
  errors = {},
  onRemove,
  onUpdate,
  onToggleColor,
  onToggleSize,
  onSetColorImages,
}: {
  item: SetItemForm;
  index: number;
  disabled: boolean;
  errors?: SingleItemFormErrors;
  onRemove: (id: string) => void;
  onUpdate: (id: string, u: Partial<SetItemForm>) => void;
  onToggleColor: (id: string, name: string, hex: string) => void;
  onToggleSize: (id: string, size: string) => void;
  onSetColorImages: (id: string, colorName: string, images: string[]) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className={`rounded-2xl border-2 ${hasErrors ? "border-red-300" : "border-gray-200"} bg-gray-50 overflow-hidden shadow-sm`}>
      {/* Header de pieza */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-[#154734]/5 to-transparent border-b border-gray-200">
        <span className={`w-7 h-7 rounded-full ${hasErrors ? "bg-red-500" : "bg-[#154734]"} text-white text-xs font-bold flex items-center justify-center shrink-0 shadow`}>
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={item.name}
            onChange={(e) => onUpdate(item.localId, { name: e.target.value })}
            placeholder="Nombre de la subcategoría (ej: Short, Pantalón, Blusa...)"
            disabled={disabled}
            className={`w-full bg-transparent border-none outline-none text-sm font-bold text-gray-800 placeholder:font-normal placeholder:text-gray-400 ${errors.name ? "text-red-700" : ""}`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="p-1.5 hover:bg-gray-200/70 rounded-lg transition-colors shrink-0"
        >
          {open
            ? <ChevronUp className="w-4 h-4 text-gray-500" />
            : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>
        <button
          type="button"
          onClick={() => onRemove(item.localId)}
          disabled={disabled}
          className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {open && (
        <div className="p-5 space-y-6">

          {/* ── BLOQUE A: Descripción ─────────────────────────── */}
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Descripción
              <span className="text-gray-300 font-normal normal-case tracking-normal">— opcional</span>
            </p>
            <textarea
              rows={2}
              value={item.description}
              onChange={(e) => onUpdate(item.localId, { description: e.target.value })}
              placeholder="Describe esta subcategoría..."
              disabled={disabled}
              className={`${fieldCls()} resize-none`}
            />
          </div>

          {/* ── BLOQUE B: Precio, Precio Anterior y Stock ────── */}
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Precio e Inventario
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Precio (COP)
                </label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => onUpdate(item.localId, { price: e.target.value })}
                  placeholder="89900"
                  min="0"
                  disabled={disabled}
                  className={fieldCls(!!errors.price)}
                />
                <FieldError msg={errors.price} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Precio Anterior <span className="font-normal text-gray-400">(tachado)</span>
                </label>
                <input
                  type="number"
                  value={item.comparePrice}
                  onChange={(e) => onUpdate(item.localId, { comparePrice: e.target.value })}
                  placeholder="120000"
                  min="0"
                  disabled={disabled}
                  className={fieldCls(!!errors.comparePrice)}
                />
                <FieldError msg={errors.comparePrice} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Stock total
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="number"
                    value={item.stock}
                    onChange={(e) => onUpdate(item.localId, { stock: e.target.value })}
                    placeholder="0"
                    min="0"
                    disabled={disabled}
                    className={`${fieldCls()} pl-8`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── BLOQUE C: Video ──────────────────────────────── */}
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" /> Video de la pieza
              <span className="text-gray-300 font-normal normal-case tracking-normal">— opcional</span>
            </p>
            <VideoUpload
              value={item.videoUrl}
              onChange={(url) => onUpdate(item.localId, { videoUrl: url })}
              disabled={disabled}
            />
            <FieldError msg={errors.videoUrl} />
          </div>

          {/* ── BLOQUE D: Colores + Imágenes ─────────────────── */}
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Colores disponibles
            </p>
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((preset) => {
                  const selected = item.colors.some((c) => c.name === preset.name);
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => onToggleColor(item.localId, preset.name, preset.hex)}
                      disabled={disabled}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                        selected
                          ? "border-[#154734] bg-[#154734]/8 text-[#154734] shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                      } disabled:opacity-50`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                      {preset.name}
                      {selected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>

              {item.colors.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-500">Imágenes por color</p>
                  {item.colors.map((color) => (
                    <div key={color.name} className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <span className="text-sm font-bold text-gray-700">{color.name}</span>
                        <span className="text-xs text-gray-400">
                          ({color.images.length} imagen{color.images.length !== 1 ? "es" : ""})
                        </span>
                      </div>
                      <ImageUpload
                        value={color.images}
                        disabled={disabled}
                        onChange={(urls) =>
                          onSetColorImages(item.localId, color.name, [...color.images, ...urls])
                        }
                        onRemove={(url) =>
                          onSetColorImages(
                            item.localId,
                            color.name,
                            color.images.filter((i) => i !== url)
                          )
                        }
                        maxImages={8}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── BLOQUE E: Tallas ─────────────────────────────── */}
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Tallas disponibles
            </p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => {
                const active = item.sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={disabled}
                    onClick={() => onToggleSize(item.localId, size)}
                    className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                      active
                        ? "bg-[#154734] text-white border-[#154734] shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#154734]/50 hover:text-[#154734]"
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
  itemErrors = {},
  onAdd,
  onRemove,
  onUpdate,
  onToggleColor,
  onToggleSize,
  onSetColorImages,
}: Props) {
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-sm font-semibold text-gray-500">Aún no hay subcategorías.</p>
          <p className="text-xs text-gray-400 mt-1">Añade subcategorías comprables de forma independiente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <SetItemCard
              key={item.localId}
              item={item}
              index={i}
              disabled={disabled}
              errors={itemErrors[item.localId]}
              onRemove={onRemove}
              onUpdate={onUpdate}
              onToggleColor={onToggleColor}
              onToggleSize={onToggleSize}
              onSetColorImages={onSetColorImages}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-[#C19A6B]/60 text-[#C19A6B] rounded-2xl text-sm font-bold hover:bg-[#C19A6B]/5 hover:border-[#C19A6B] transition-all disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        Añadir subcategoría
      </button>
    </div>
  );
}
