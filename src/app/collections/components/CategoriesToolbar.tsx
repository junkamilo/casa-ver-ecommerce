"use client";

import { useState, useRef, useEffect } from "react";
import { LayoutGrid, List, ChevronDown, Check } from "lucide-react";
import { SORT_OPTIONS, type SortValue } from "../constants";

interface CategoriesToolbarProps {
  count: number;
  viewMode: "grid" | "list";
  onViewModeChange: (m: "grid" | "list") => void;
  sortBy: SortValue;
  onSortChange: (s: SortValue) => void;
}

export function CategoriesToolbar({
  count,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
}: CategoriesToolbarProps) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Ordenar";

  return (
    <div className="flex justify-between items-center gap-5 pb-6 border-b border-gray-100 relative z-30">

      {/* Contador */}
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">
        <strong className="text-[#154734]">{count}</strong>
        <span className="hidden sm:inline"> colecciones</span>
        <span className="sm:hidden"> cols</span>
      </span>

      {/* Ordenar + Vista */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* Dropdown ordenamiento */}
        <div className="relative flex items-center gap-2" ref={dropdownRef}>
          <span className="hidden sm:block text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#154734] whitespace-nowrap">
            Ordenar por:
          </span>

          <button
            onClick={() => setIsSortOpen((v) => !v)}
            className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C19A6B] hover:text-[#154734] transition-colors duration-300 py-1 active:scale-95"
          >
            <span className="truncate max-w-27.5 sm:max-w-none">{currentLabel}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`} />
          </button>

          {isSortOpen && (
            <div className="absolute top-full right-0 sm:left-1/2 sm:-translate-x-1/2 mt-3 w-52 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_40px_-15px_rgba(21,71,52,0.15)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50 py-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onSortChange(opt.value); setIsSortOpen(false); }}
                  className="w-full text-left px-5 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors duration-200 flex items-center justify-between group hover:bg-[#FAFAFA] active:scale-95"
                >
                  <span className={sortBy === opt.value ? "text-[#C19A6B]" : "text-gray-500 group-hover:text-[#154734]"}>
                    {opt.label}
                  </span>
                  {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-[#C19A6B]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botones de vista */}
        <div className="flex items-center gap-2 border-l pl-4 sm:pl-6 border-gray-200">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-lg border transition-all duration-300 active:scale-90 ${
              viewMode === "grid"
                ? "bg-[#FAFAFA] text-[#154734] border-gray-200 shadow-inner"
                : "bg-white text-gray-300 hover:text-[#C19A6B] hover:bg-[#FAFAFA] hover:border-[#C19A6B]/30 border-transparent"
            }`}
            aria-label="Vista cuadrícula"
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
            aria-label="Vista lista"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
