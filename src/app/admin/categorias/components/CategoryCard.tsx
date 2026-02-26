import { FolderOpen, Pencil, Eye, EyeOff } from "lucide-react";
import type { Category } from "../types/types";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onToggleActive: (category: Category) => void;
}

const CategoryCard = ({ category, onEdit, onToggleActive }: CategoryCardProps) => (
  <div
    className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-shadow relative ${
      !category.isActive ? "opacity-60 border-gray-200" : "border-gray-200"
    }`}
  >
    <div className="absolute top-3 right-3">
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          category.isActive
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {category.isActive ? "Activa" : "Inactiva"}
      </span>
    </div>

    <div className="flex gap-3 pr-16">
      {category.image ? (
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="p-3 bg-green-50 rounded-xl text-[#154734] self-start shrink-0">
          <FolderOpen className="w-6 h-6" />
        </div>
      )}
      <div className="min-w-0">
        <h3 className="font-bold text-gray-900 text-lg truncate">{category.name}</h3>
        <p className="text-xs text-gray-400 font-mono mt-1">/{category.slug}</p>
      </div>
    </div>

    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
        {category.description || "Sin descripción"}
      </p>
      <div className="flex items-center justify-between">
        <span className="bg-[#C19A6B]/10 text-[#C19A6B] px-2 py-1 rounded-md text-xs font-bold border border-[#C19A6B]/20">
          {category._count?.products || 0} Productos
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-gray-400 hover:text-[#154734] hover:bg-green-50 rounded-lg transition-colors"
            title="Editar categoría"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleActive(category)}
            className={`p-2 rounded-lg transition-colors ${
              category.isActive
                ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                : "text-gray-400 hover:text-green-600 hover:bg-green-50"
            }`}
            title={category.isActive ? "Desactivar categoría" : "Activar categoría"}
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
