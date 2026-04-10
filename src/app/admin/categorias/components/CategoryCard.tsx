import { Pencil, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import type { CategoryCardProps } from "../types/types";

const CategoryCard = ({ category, isFirst, isLast, canReorder, onEdit, onToggleActive, onMoveUp, onMoveDown }: CategoryCardProps) => (
  <div
    className={`group bg-white rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
      !category.isActive ? "opacity-60 border-gray-200 grayscale-[0.2]" : "border-[#C19A6B]/10 shadow-sm"
    }`}
  >
    {/* Imagen / Fallback Superior */}
    <div className="relative h-32 border-b border-gray-100 overflow-hidden flex items-center justify-center">
      {category.image ? (
        <>
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[#154734] flex items-center justify-center px-4">
          <span className="text-[#C19A6B] font-black uppercase tracking-widest text-sm text-center leading-tight group-hover:-translate-y-1 transition-transform duration-500 ease-in-out">
            {category.name}
          </span>
        </div>
      )}

      {/* Botones de orden */}
      {canReorder && (
        <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onMoveUp(category)}
            disabled={isFirst}
            className="p-1 rounded-lg bg-white/80 backdrop-blur-sm text-[#154734] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            title="Mover arriba"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMoveDown(category)}
            disabled={isLast}
            className="p-1 rounded-lg bg-white/80 backdrop-blur-sm text-[#154734] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            title="Mover abajo"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Badge Flotante */}
      <div className="absolute top-4 right-4">
        <span
          className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${
            category.isActive
              ? "bg-white/90 text-[#154734]"
              : "bg-black/50 text-white"
          }`}
        >
          {category.isActive ? "Activa" : "Oculta"}
        </span>
      </div>
    </div>

    {/* Contenido */}
    <div className="p-6">
      <div className="mb-4">
        <h3 
          className="text-2xl text-[#154734] truncate"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {category.name}
        </h3>
      </div>

      {/* Footer de la tarjeta */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="bg-[#FAFAFA] text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C19A6B]" />
            {category._count?.products || 0} Productos
          </span>
          {canReorder && (
            <span className="text-[10px] text-gray-400 font-mono">#{category.order + 1}</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(category)}
            className="p-2.5 text-gray-400 hover:text-[#C19A6B] hover:bg-[#C19A6B]/10 rounded-xl transition-all"
            title="Editar colección"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleActive(category)}
            className={`p-2.5 rounded-xl transition-all ${
              category.isActive
                ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
                : "text-gray-400 hover:text-[#154734] hover:bg-[#154734]/10"
            }`}
            title={category.isActive ? "Ocultar colección" : "Mostrar colección"}
          >
            {category.isActive ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default CategoryCard;
