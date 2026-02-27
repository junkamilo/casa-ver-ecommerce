import { FolderOpen, Pencil, Eye, EyeOff } from "lucide-react";
import type { Category } from "../types/types";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onToggleActive: (category: Category) => void;
}

const CategoryCard = ({ category, onEdit, onToggleActive }: CategoryCardProps) => (
  <div
    className={`group bg-white rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
      !category.isActive ? "opacity-60 border-gray-200 grayscale-[0.2]" : "border-[#C19A6B]/10 shadow-sm"
    }`}
  >
    {/* Imagen / Banner Superior */}
    <div className="relative h-32 bg-[#FAFAFA] border-b border-gray-100 overflow-hidden flex items-center justify-center">
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
        <div className="absolute inset-0 flex items-center justify-center bg-[#154734]/5">
          <FolderOpen className="w-10 h-10 text-[#C19A6B]/40" />
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

      <p className="text-sm text-gray-500 mb-6 line-clamp-2 font-light leading-relaxed min-h-[2.5rem]">
        {category.description || "Sin descripción asignada para esta colección."}
      </p>

      {/* Footer de la tarjeta */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="bg-[#FAFAFA] text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C19A6B]" />
          {category._count?.products || 0} Productos
        </span>

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
