import { Search } from "lucide-react";

interface CategorySearchProps {
  value: string;
  onChange: (v: string) => void;
}

const CategorySearch = ({ value, onChange }: CategorySearchProps) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
    <div className="relative w-full md:max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar categoría..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#C19A6B]/10 transition-all"
      />
    </div>
  </div>
);

export default CategorySearch;
