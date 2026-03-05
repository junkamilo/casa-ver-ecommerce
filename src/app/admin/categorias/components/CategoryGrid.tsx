import { Loader2, Sparkles } from "lucide-react";
import CategoryCard from "./CategoryCard";
import type { Category } from "../types/types";

interface CategoryGridProps {
  loading: boolean;
  filtered: Category[];
  onEdit: (category: Category) => void;
  onToggleActive: (category: Category) => void;
}

const CategoryGrid = ({ loading, filtered, onEdit, onToggleActive }: CategoryGridProps) => {
  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center animate-in fade-in duration-500">
        <Loader2 className="w-10 h-10 animate-spin text-[#C19A6B] mb-4" />
        <p className="text-sm font-semibold tracking-widest text-[#154734] uppercase">Cargando Colecciones...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filtered.map((cat, index) => (
        <div 
          key={cat.id} 
          className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CategoryCard
            category={cat}
            onEdit={onEdit}
            onToggleActive={onToggleActive}
          />
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="col-span-full py-24 flex flex-col items-center text-center bg-white rounded-3xl border border-dashed border-[#C19A6B]/30 animate-in fade-in">
          <div className="w-16 h-16 bg-[#FAFAFA] rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-[#C19A6B]/50" />
          </div>
          <h3 className="text-xl text-[#154734] font-serif italic mb-2">No hay resultados</h3>
          <p className="text-gray-400 font-light max-w-sm">No pudimos encontrar ninguna categoría que coincida con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;
