import { Plus } from "lucide-react";
import { SetItemsSectionProps } from "../../types";
import SetItemCard from "./SetItemCard";

export default function SetItemsSection({
  items,
  disabled,
  itemErrors = {},
  noItemsError,
  onAdd,
  onRemove,
  onUpdate,
  onToggleColor,
  onToggleSize,
  onSetColorImages,
  onUpdateVariantStock,
  scrollContainer,
}: SetItemsSectionProps & { scrollContainer?: Element | null }) {
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className={`text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed transition-colors ${noItemsError ? "border-red-400 bg-red-50/30" : "border-gray-200"}`}>
          <p className={`text-sm font-semibold ${noItemsError ? "text-red-500" : "text-gray-500"}`}>
            {noItemsError ?? "Aún no hay subcategorías."}
          </p>
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
              onUpdateVariantStock={onUpdateVariantStock}
              scrollContainer={scrollContainer}
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
