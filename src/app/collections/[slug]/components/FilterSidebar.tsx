"use client";

import { useState, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

interface FilterSidebarProps {
  availableColors: { name: string; hexCode: string }[];
  maxPriceDb: number;
}

export function FilterSidebar({ availableColors, maxPriceDb }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isColorOpen, setIsColorOpen] = useState(true);

  const [minPriceInput, setMinPriceInput] = useState(searchParams.get("minPrice") ?? "");
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get("maxPrice") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeColor = searchParams.get("color");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handlePriceChange(key: "minPrice" | "maxPrice", value: string) {
    if (key === "minPrice") setMinPriceInput(value);
    else setMaxPriceInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam(key, value), 600);
  }

  function handleColorToggle(hexCode: string) {
    const hex = hexCode.replace("#", "");
    updateParam("color", activeColor === hex ? null : hex);
  }

  function clearAllFilters() {
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push(pathname);
  }

  const hasActiveFilters = activeColor || searchParams.get("minPrice") || searchParams.get("maxPrice");

  return (
    <aside className="w-full bg-white border border-gray-100/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(21,71,52,0.05)] relative overflow-hidden isolate">

      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C19A6B]/5 to-transparent rounded-bl-full pointer-events-none -z-10" />

      {/* Cabecera */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-5 h-5 text-[#C19A6B]" />
          <h2 className="text-base font-bold text-[#154734] uppercase tracking-widest">Filtrar</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-400 transition-colors"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Sección: Precio */}
      <div className="border-b border-gray-100 pb-6 mb-6">
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="flex items-center justify-between w-full text-sm font-bold text-[#154734] uppercase tracking-wider group"
        >
          <span className="group-hover:text-[#C19A6B] transition-colors">Precio</span>
          <ChevronDown className={`w-4 h-4 text-[#C19A6B] transition-transform duration-300 ${isPriceOpen ? "rotate-180" : ""}`} />
        </button>

        <div className={`transition-all duration-500 overflow-hidden ${isPriceOpen ? "max-h-48 opacity-100 mt-5" : "max-h-0 opacity-0 mt-0"}`}>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">Rango de precio</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#C19A6B]">$</span>
              <input
                type="number"
                value={minPriceInput}
                onChange={(e) => handlePriceChange("minPrice", e.target.value)}
                placeholder="0"
                min={0}
                className="w-full pl-7 pr-2 py-3 text-sm text-[#154734] font-medium bg-[#FAFAFA] border border-gray-200 rounded-xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all shadow-inner focus:shadow-md"
              />
            </div>
            <span className="text-sm font-medium text-gray-400">a</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#C19A6B]">$</span>
              <input
                type="number"
                value={maxPriceInput}
                onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
                placeholder={maxPriceDb > 0 ? String(maxPriceDb) : "0"}
                min={0}
                className="w-full pl-7 pr-2 py-3 text-sm text-[#154734] font-medium bg-[#FAFAFA] border border-gray-200 rounded-xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all shadow-inner focus:shadow-md"
              />
            </div>
          </div>
          {maxPriceDb > 0 && (
            <p className="text-[10px] text-gray-500 italic">
              El precio más alto es <strong className="text-[#154734]">${maxPriceDb.toLocaleString("es-CO")}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Sección: Color */}
      {availableColors.length > 0 && (
        <div className="pb-2">
          <button
            onClick={() => setIsColorOpen(!isColorOpen)}
            className="flex items-center justify-between w-full text-sm font-bold text-[#154734] uppercase tracking-wider group"
          >
            <span className="group-hover:text-[#C19A6B] transition-colors">Color</span>
            <ChevronDown className={`w-4 h-4 text-[#C19A6B] transition-transform duration-300 ${isColorOpen ? "rotate-180" : ""}`} />
          </button>

          <div className={`transition-all duration-500 overflow-hidden ${isColorOpen ? "max-h-48 opacity-100 mt-5" : "max-h-0 opacity-0 mt-0"}`}>
            <div className="flex flex-wrap gap-3">
              {availableColors.map((color) => {
                const hex = color.hexCode.replace("#", "");
                const isActive = activeColor === hex;
                return (
                  <button
                    key={color.hexCode}
                    onClick={() => handleColorToggle(color.hexCode)}
                    title={color.name}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 shadow-sm hover:scale-110 active:scale-95 ${
                      isActive
                        ? "border-[#154734] ring-2 ring-[#154734]/30 scale-110"
                        : "border-white hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: color.hexCode }}
                  />
                );
              })}
            </div>
            {activeColor && (
              <p className="text-[10px] text-gray-500 mt-3 italic">
                Color:{" "}
                <strong className="text-[#154734]">
                  {availableColors.find((c) => c.hexCode.replace("#", "") === activeColor)?.name ?? activeColor}
                </strong>
              </p>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
