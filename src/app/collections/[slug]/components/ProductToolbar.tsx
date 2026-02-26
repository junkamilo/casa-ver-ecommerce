import { SlidersHorizontal, ChevronDown, LayoutGrid, List } from "lucide-react";

interface ProductToolbarProps {
  count: number;
  onOpenMobileFilters: () => void;
}

export function ProductToolbar({ count, onOpenMobileFilters }: ProductToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      <button
        className="lg:hidden flex items-center gap-1.5 text-sm text-foreground font-medium"
        onClick={onOpenMobileFilters}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtros
      </button>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-6 text-sm">
        <span className="text-muted-foreground">{count} artículos</span>

        <div className="flex items-center gap-2 cursor-pointer hover:text-muted-foreground">
          <span>Ordenar</span>
          <ChevronDown className="w-4 h-4" />
        </div>

        <div className="flex items-center gap-2 border-l pl-4 border-border">
          <LayoutGrid className="w-5 h-5 cursor-pointer text-foreground" />
          <List className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-foreground" />
        </div>
      </div>
    </div>
  );
}
