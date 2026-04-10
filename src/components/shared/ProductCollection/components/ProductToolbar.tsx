"use client";

import { LayoutGrid, List, ChevronDown, Check, SlidersHorizontal } from "lucide-react";
import { useSortDropdown } from "../hooks/useSortDropdown";
import { SORT_OPTIONS } from "../constants";
import { ProductToolbarProps } from '../types/index';


export function ProductToolbar({
  count,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  onFilterOpen,
  hasActiveFilters = false,
}: ProductToolbarProps) {
  const { isSortOpen, setIsSortOpen, dropdownRef } = useSortDropdown();

  const currentSortLabel = SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || "Ordenar";

  return (
    <div className="flex justify-between items-center gap-5 pb-6 border-b border-gray-100 relative z-30">

      {/* Izquierda: Contador + Botón Filtrar (móvil) */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">
          <strong className="text-[#154734]">{count}</strong>
          <span className="hidden sm:inline"> artículos</span>
          <span className="sm:hidden"> arts</span>
        </span>

        {onFilterOpen && (
          <button
            onClick={onFilterOpen}
            className={`lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all duration-300 active:scale-95 ${
              hasActiveFilters
                ? "bg-[#154734] text-white border-[#154734] shadow-[0_4px_12px_-4px_rgba(21,71,52,0.4)]"
                : "bg-white text-[#154734] border-gray-200 hover:border-[#C19A6B]/50 hover:text-[#C19A6B]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtrar</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#C19A6B]" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Lado Derecho: Ordenar y Vistas */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* Menú Desplegable de Ordenamiento */}
        <div className="relative flex items-center gap-2" ref={dropdownRef}>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#154734] whitespace-nowrap hidden sm:block">
            Ordenar por:
          </span>

          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C19A6B] hover:text-[#154734] transition-colors duration-300 py-1 active:scale-95"
          >
            <span className="truncate max-w-27.5 sm:max-w-none">{currentSortLabel}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`} />
          </button>

          {isSortOpen && (
            <div className="absolute top-full right-0 sm:left-1/2 sm:-translate-x-1/2 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_40px_-15px_rgba(21,71,52,0.15)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50 py-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setIsSortOpen(false);
                  }}
                  className="w-full text-left px-5 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors duration-200 flex items-center justify-between group hover:bg-[#FAFAFA] active:scale-95"
                >
                  <span className={`${sortBy === option.value ? "text-[#C19A6B]" : "text-gray-500 group-hover:text-[#154734]"}`}>
                    {option.label}
                  </span>
                  {sortBy === option.value && (
                    <Check className="w-3.5 h-3.5 text-[#C19A6B]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botones de Vista */}
        <div className="flex items-center gap-2 border-l pl-4 sm:pl-6 border-gray-200">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-lg border transition-all duration-300 active:scale-90 ${
              viewMode === "grid"
                ? "bg-[#FAFAFA] text-[#154734] border-gray-200 shadow-inner"
                : "bg-white text-gray-300 hover:text-[#C19A6B] hover:bg-[#FAFAFA] hover:border-[#C19A6B]/30 border-transparent"
            }`}
            aria-label="Vista de cuadrícula"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded-lg border transition-all duration-300 active:scale-90 ${
              viewMode === "list"
                ? "bg-[#FAFAFA] text-[#154734] border-gray-200 shadow-inner"
                : "bg-white text-gray-300 hover:text-[#C19A6B] hover:bg-[#FAFAFA] hover:border-[#C19A6B]/30 border-transparent"
            }`}
            aria-label="Vista de lista"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
