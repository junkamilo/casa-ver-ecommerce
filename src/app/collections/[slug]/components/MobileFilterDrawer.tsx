import { X, ChevronDown } from "lucide-react";
import { MAX_PRICE } from "../constants";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAvailabilityOpen: boolean;
  onToggleAvailability: () => void;
  isPriceOpen: boolean;
  onTogglePrice: () => void;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  isAvailabilityOpen,
  onToggleAvailability,
  isPriceOpen,
  onTogglePrice,
}: MobileFilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 lg:hidden flex">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative w-4/5 max-w-xs bg-background h-full shadow-2xl p-5 overflow-y-auto animate-in slide-in-from-left duration-300">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-foreground">Filtros</span>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-b border-border py-4">
          <button
            onClick={onToggleAvailability}
            className="flex items-center justify-between w-full text-sm font-medium"
          >
            <span>Disponibilidad</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isAvailabilityOpen ? "rotate-180" : ""}`} />
          </button>
          {isAvailabilityOpen && (
            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                En existencia
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                Agotado
              </label>
            </div>
          )}
        </div>

        <div className="border-b border-border py-4">
          <button
            onClick={onTogglePrice}
            className="flex items-center justify-between w-full text-sm font-medium"
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
      </div>
    </div>
  );
}
