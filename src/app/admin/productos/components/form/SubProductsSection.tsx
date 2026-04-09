import { Plus, Package } from "lucide-react";
import { SubProductsSectionProps } from "../../types";
import SubProductCard from "./SubProductCard";

export default function SubProductsSection({
  items,
  disabled,
  itemErrors = {},
  onAdd,
  onRemove,
  onUpdate,
  onToggleColor,
  onToggleSize,
  onSetColorImages,
  onUpdateVariantStock,
}: SubProductsSectionProps) {
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-[#C19A6B]/30">
          <Package className="w-8 h-8 text-[#C19A6B]/40 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-500">Aún no hay sub-productos.</p>
          <p className="text-xs text-gray-400 mt-1">
            Añade piezas que se puedan vender de forma independiente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <SubProductCard
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
              onUpdateVariantStock={onUpdateVariantStock}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-[#C19A6B]/50 text-[#C19A6B] rounded-2xl text-sm font-bold hover:bg-[#C19A6B]/5 hover:border-[#C19A6B] transition-all disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        Añadir sub-producto
      </button>
    </div>
  );
}
