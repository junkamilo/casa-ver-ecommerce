import { Search, Filter } from "lucide-react";
import { Category } from "../types";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  filterCategory: string;
  onCategoryChange: (v: string) => void;
  categories: Category[];
}

export default function ProductFilters({
  search,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  categories,
}: Props) {
  return (
    <div className="flex flex-row gap-2 items-center">
      {/* Buscador */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20 transition-all"
        />
      </div>

      {/* Filtro categoría */}
      <div className="relative w-36 shrink-0">
        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <select
          value={filterCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full pl-8 pr-6 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 bg-white appearance-none cursor-pointer hover:border-[#154734] transition-colors"
        >
          <option>Todos</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
