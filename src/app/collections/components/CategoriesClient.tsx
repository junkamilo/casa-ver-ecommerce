"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, List, ChevronDown, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

interface CategoriesClientProps {
  categories: Category[];
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevancia" },
  { value: "name-asc",  label: "Nombre A → Z" },
  { value: "name-desc", label: "Nombre Z → A" },
];

// ── Toolbar ──────────────────────────────────────────────────────────────────
function CategoriesToolbar({
  count,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
}: {
  count: number;
  viewMode: "grid" | "list";
  onViewModeChange: (m: "grid" | "list") => void;
  sortBy: string;
  onSortChange: (s: string) => void;
}) {
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

// ── Tarjeta lista ─────────────────────────────────────────────────────────────
function CategoryListCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/collections/${category.slug}`}
      className="group flex gap-4 sm:gap-6 bg-white p-3 sm:p-4 rounded-[1.5rem] border border-[#C19A6B]/20 hover:border-[#C19A6B]/60 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(193,154,107,0.15)] transition-all duration-500"
    >
      {/* Miniatura */}
      <div className="relative w-24 sm:w-36 shrink-0 aspect-square overflow-hidden rounded-xl bg-[#154734]">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 96px, 144px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#C19A6B] font-black text-xs uppercase tracking-widest text-center px-2">
              {category.name}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#081c14]/50 to-transparent opacity-60 pointer-events-none" />
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center gap-2 flex-1 py-1">
        <h3 className="text-sm sm:text-base font-bold uppercase tracking-widest text-[#154734] group-hover:text-[#C19A6B] transition-colors duration-300">
          {category.name}
        </h3>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="h-px w-4 bg-[#C19A6B]" />
          <span className="text-[#C19A6B] text-[10px] font-black tracking-[0.25em] uppercase">Explorar</span>
        </div>
      </div>

      {/* Flecha */}
      <div className="flex items-center pr-1 text-gray-300 group-hover:text-[#C19A6B] transition-colors duration-300 shrink-0">
        <ChevronDown className="w-4 h-4 -rotate-90" />
      </div>
    </Link>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function CategoriesClient({ categories }: CategoriesClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");

  const sorted = useMemo(() => {
    const arr = [...categories];
    if (sortBy === "name-asc") return arr.sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (sortBy === "name-desc") return arr.sort((a, b) => b.name.localeCompare(a.name, "es"));
    return arr; // relevance = orden original del servidor
  }, [categories, sortBy]);

  return (
    <div className="bg-white rounded-4xl sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 shadow-[0_20px_50px_-15px_rgba(21,71,52,0.05)] border border-gray-100/80 relative overflow-hidden isolate animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 fill-mode-both">

      <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-[#C19A6B]/5 to-transparent rounded-bl-full pointer-events-none -z-10" />

      <CategoriesToolbar
        count={sorted.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="mt-8 sm:mt-10">
        {viewMode === "list" ? (
          <div className="flex flex-col gap-4 sm:gap-5">
            {sorted.map((col, i) => (
              <div
                key={col.id}
                className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CategoryListCard category={col} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {sorted.map((col, i) => (
              <div
                key={col.id}
                className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <Link
                  href={`/collections/${col.slug}`}
                  className="group block relative cursor-pointer w-full aspect-4/5 overflow-hidden bg-[#154734] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(21,71,52,0.2)] transition-all duration-500 rounded-2xl"
                >
                  {col.image ? (
                    <>
                      <Image
                        src={col.image}
                        alt={col.name}
                        fill
                        className="object-cover object-center group-hover:scale-110 transition-transform duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
                        sizes="(max-width: 640px) 48vw, (max-width: 768px) 40vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-[#081c14]/90 via-[#0a2318]/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                      <span className="text-[#C19A6B] font-black uppercase tracking-widest text-sm sm:text-base text-center leading-tight group-hover:-translate-y-2 transition-transform duration-500">
                        {col.name}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-4 border border-[#C19A6B]/0 group-hover:border-[#C19A6B]/30 transition-colors duration-700 pointer-events-none z-10" />

                  {col.image && (
                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 z-20">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <h3 className="text-white text-sm sm:text-lg font-bold tracking-[0.2em] uppercase mb-2 drop-shadow-md">
                          {col.name}
                        </h3>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                          <span className="h-px w-4 bg-[#C19A6B]" />
                          <span className="text-[#C19A6B] text-[10px] font-black tracking-[0.25em] uppercase">Explorar</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!col.image && (
                    <div className="absolute bottom-5 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 z-20">
                      <div className="flex items-center gap-2">
                        <span className="h-px w-4 bg-[#C19A6B]" />
                        <span className="text-[#C19A6B] text-[10px] font-black tracking-[0.25em] uppercase">Explorar</span>
                      </div>
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
