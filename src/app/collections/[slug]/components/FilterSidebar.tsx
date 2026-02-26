import { ChevronDown } from "lucide-react";
import { MAX_PRICE } from "../constants";

interface FilterSidebarProps {
  isAvailabilityOpen: boolean;
  onToggleAvailability: () => void;
  isPriceOpen: boolean;
  onTogglePrice: () => void;
}

export function FilterSidebar({
  isAvailabilityOpen,
  onToggleAvailability,
  isPriceOpen,
  onTogglePrice,
}: FilterSidebarProps) {
  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24">
      <h2 className="text-xl font-bold mb-6">Filtros</h2>

      <div className="border-b border-border py-4">
        <button
          onClick={onToggleAvailability}
          className="flex items-center justify-between w-full text-sm font-medium hover:text-muted-foreground transition-colors"
        >
          <span>Disponibilidad</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isAvailabilityOpen ? "rotate-180" : ""}`} />
        </button>
        {isAvailabilityOpen && (
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
              En existencia
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
              Agotado
            </label>
          </div>
        )}
      </div>

      <div className="border-b border-border py-4">
        <button
          onClick={onTogglePrice}
          className="flex items-center justify-between w-full text-sm font-medium hover:text-muted-foreground transition-colors"
        >
          <span>Precio</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isPriceOpen ? "rotate-180" : ""}`} />
        </button>
        {isPriceOpen && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                <input type="number" placeholder="0" className="w-full pl-6 pr-2 py-2 text-sm border border-border rounded" />
              </div>
              <span className="text-sm text-muted-foreground">a</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                <input type="number" placeholder={String(MAX_PRICE)} className="w-full pl-6 pr-2 py-2 text-sm border border-border rounded" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">El precio más alto es ${MAX_PRICE.toLocaleString()}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
