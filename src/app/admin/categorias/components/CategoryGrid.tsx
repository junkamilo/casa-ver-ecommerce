import { Loader2 } from "lucide-react";
import CategoryCard from "./CategoryCard";
import type { Category } from "../types/types";

interface CategoryGridProps {
  loading: boolean;
  filtered: Category[];
  onDelete: (id: string) => void;
}

const CategoryGrid = ({ loading, filtered, onDelete }: CategoryGridProps) => {
  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((cat) => (
        <CategoryCard key={cat.id} category={cat} onDelete={onDelete} />
      ))}

      {filtered.length === 0 && (
        <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
          <p>No se encontraron categorías</p>
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;
