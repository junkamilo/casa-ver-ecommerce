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
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#C19A6B]/10 transition-all"
        />
      </div>
      <div className="relative w-full md:w-48">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <select
          value={filterCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 bg-white appearance-none cursor-pointer hover:border-[#154734]"
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
