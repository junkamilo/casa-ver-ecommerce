import { FolderOpen, Trash2 } from "lucide-react";
import type { Category } from "../types/types";

interface CategoryCardProps {
  category: Category;
  onDelete: (id: string) => void;
}

const CategoryCard = ({ category, onDelete }: CategoryCardProps) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative">
    <div className="flex justify-between items-start">
      <div className="flex gap-3">
        <div className="p-3 bg-green-50 rounded-xl text-[#154734]">
          <FolderOpen className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
          <p className="text-xs text-gray-400 font-mono mt-1">/{category.slug}</p>
        </div>
      </div>
      <button
        onClick={() => onDelete(category.id)}
        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>

    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
      <span className="text-gray-500">{category.description || "Sin descripción"}</span>
      <span className="bg-[#C19A6B]/10 text-[#C19A6B] px-2 py-1 rounded-md text-xs font-bold border border-[#C19A6B]/20">
        {category._count?.products || 0} Productos
      </span>
    </div>
  </div>
);

export default CategoryCard;
