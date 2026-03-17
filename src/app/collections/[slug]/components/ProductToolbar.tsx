"use client";

import { useState, useRef, useEffect } from "react";
import { LayoutGrid, List, ChevronDown, Check } from "lucide-react";

interface ProductToolbarProps {
  count: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevancia" },
  { value: "price-desc", label: "Mayor a menor precio" },
  { value: "price-asc", label: "Menor a mayor precio" },
  { value: "featured", label: "Más vendidos" },
  { value: "newest", label: "Más recientes" },
];

export function ProductToolbar({
  count,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
}: ProductToolbarProps) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSortLabel = SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || "Ordenar";

  return (
    <div className="flex justify-between items-center gap-5 pb-6 border-b border-gray-100 relative z-30">

      {/* Contador */}
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">
        <strong className="text-[#154734]">{count}</strong>
        <span className="hidden sm:inline"> artículos</span>
        <span className="sm:hidden"> arts</span>
      </span>

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
