import { Sparkles, Plus } from "lucide-react";

interface CategoryPageHeaderProps {
  onNew: () => void;
}

const CategoryPageHeader = ({ onNew }: CategoryPageHeaderProps) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="h-px w-8 bg-[#C19A6B]" />
        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#C19A6B] flex items-center gap-2">
          <Sparkles className="w-3 h-3" />
          Administración
        </span>
      </div>
      <h1 className="text-4xl sm:text-5xl text-[#154734] leading-none tracking-tight">
        <span className="font-bold uppercase tracking-widest block text-2xl sm:text-3xl mb-1">Gestión de</span>
        <span className="italic text-[#C19A6B]" style={{ fontFamily: "Georgia, serif" }}>Categorías</span>
      </h1>
    </div>

    <button
      onClick={onNew}
      className="inline-flex items-center justify-center gap-2 bg-[#154734] hover:bg-[#103a2a] text-white px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-[#154734]/30 active:scale-95 font-bold uppercase tracking-widest text-xs"
    >
      <Plus className="w-4 h-4" />
      Nueva Categoría
    </button>
  </div>
);

export default CategoryPageHeader;
