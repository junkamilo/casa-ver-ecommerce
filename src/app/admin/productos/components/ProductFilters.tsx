"use client";

import { Search, SlidersHorizontal, Check, ChevronDown } from "lucide-react";
import { ProductFiltersProps } from "../types";
import { useDropdown } from "../hooks/useDropdown";

const ALL_LABEL = "Todos";

export default function ProductFilters({
  search,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  categories,
}: ProductFiltersProps) {
  const { open, setOpen, ref } = useDropdown();

  const options = [ALL_LABEL, ...categories.map((c) => c.name)];
  const isFiltered = filterCategory !== ALL_LABEL;

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

      {/* Filtro categoría — dropdown personalizado */}
      <div ref={ref} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer select-none
            ${open
              ? "border-[#154734] bg-[#154734]/5 text-[#154734] ring-2 ring-[#154734]/20"
              : isFiltered
                ? "border-[#154734] bg-[#154734] text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-600 hover:border-[#154734]/50 hover:text-[#154734]"
            }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap max-w-[90px] truncate">
            {filterCategory}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[180px] bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Cabecera */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Categoría
              </p>
            </div>

            {/* Opciones */}
            <ul className="py-1.5 max-h-64 overflow-y-auto">
              {options.map((opt) => {
                const selected = filterCategory === opt;
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() => {
                        onCategoryChange(opt);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer
                        ${selected
                          ? "bg-[#154734]/8 text-[#154734] font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <span>{opt}</span>
                      {selected && (
                        <Check className="w-3.5 h-3.5 text-[#154734] shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Pie — limpiar filtro */}
            {isFiltered && (
              <div className="px-3 py-2.5 border-t border-gray-100 bg-gray-50/70">
                <button
                  type="button"
                  onClick={() => {
                    onCategoryChange(ALL_LABEL);
                    setOpen(false);
                  }}
                  className="w-full text-xs text-[#C19A6B] font-medium hover:text-[#a07850] transition-colors cursor-pointer text-center"
                >
                  Limpiar filtro
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
