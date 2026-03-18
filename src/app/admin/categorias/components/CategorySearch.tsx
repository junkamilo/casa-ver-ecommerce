import { Search } from "lucide-react";

interface CategorySearchProps {
  value: string;
  onChange: (v: string) => void;
}

const CategorySearch = ({ value, onChange }: CategorySearchProps) => (
  <div className="relative w-full max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl 2xl:max-w-3xl mx-auto mt-8 mb-10 group">
    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
      <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#C19A6B] transition-colors" />
    </div>
    <input
      type="text"
      placeholder="Buscar colección o categoría..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 transition-all shadow-sm hover:shadow-md text-[#154734] font-medium placeholder:font-normal placeholder:text-gray-400"
    />
  </div>
);

export default CategorySearch;
