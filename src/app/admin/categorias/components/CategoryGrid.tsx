import { Loader2 } from "lucide-react";
import CategoryCard from "./CategoryCard";
import type { CategoryGridProps } from "../types/types";
import SectionEmptyState from "@/components/ui/SectionEmptyState";

const CategoryGrid = ({ loading, filtered, onEdit, onToggleActive, onDelete }: CategoryGridProps) => {
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
            onDelete={onDelete}
          />
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="col-span-full">
          <SectionEmptyState message="No se encontraron categorías." />
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;
