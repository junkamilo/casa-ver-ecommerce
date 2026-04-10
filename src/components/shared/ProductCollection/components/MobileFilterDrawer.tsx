"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useMobileFilterDrawer } from "../hooks/useMobileFilterDrawer";
import { MobileFilterDrawerProps } from '../types/index';


export function MobileFilterDrawer({
  isOpen,
  onClose,
  availableColors,
  maxPriceDb,
}: MobileFilterDrawerProps) {
  const {
    isPriceOpen,
    setIsPriceOpen,
    isColorOpen,
    setIsColorOpen,
    minPriceInput,
    maxPriceInput,
    activeColor,
    hasActiveFilters,
    handlePriceChange,
    handleColorToggle,
    clearAllFilters,
  } = useMobileFilterDrawer();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#154734]/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-[85%] max-w-sm bg-white h-full shadow-[20px_0_40px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-left duration-500 ease-out">

        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-[#C19A6B]" />
            <span className="text-base font-bold text-[#154734] uppercase tracking-widest">Filtrar</span>
          </div>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-400 transition-colors"
              >
                Limpiar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-[#154734] hover:bg-gray-100 rounded-full transition-colors duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Sección: Precio */}
          <div className="border border-gray-100 rounded-2xl bg-[#FAFAFA] overflow-hidden">
            <button
              onClick={() => setIsPriceOpen(!isPriceOpen)}
              className="flex items-center justify-between w-full p-4 text-sm font-bold text-[#154734] uppercase tracking-wider bg-white hover:bg-gray-50 transition-colors"
            >
              <span>Precio</span>
              <ChevronDown className={`w-4 h-4 text-[#C19A6B] transition-transform duration-300 ${isPriceOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`transition-all duration-300 overflow-hidden ${isPriceOpen ? "max-h-56 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="p-4 bg-[#FAFAFA]">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Rango de precio</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#C19A6B]">$</span>
                    <input
                      type="number"
                      value={minPriceInput}
                      onChange={(e) => handlePriceChange("minPrice", e.target.value)}
                      placeholder="0"
                      min={0}
                      className="w-full pl-7 pr-3 py-3 text-sm text-[#154734] font-medium bg-white border border-gray-200 rounded-xl focus:border-[#C19A6B] focus:ring-2 focus:ring-[#C19A6B]/20 outline-none transition-all"
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
                      className="w-full pl-7 pr-3 py-3 text-sm text-[#154734] font-medium bg-white border border-gray-200 rounded-xl focus:border-[#C19A6B] focus:ring-2 focus:ring-[#C19A6B]/20 outline-none transition-all"
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
          </div>

          {/* Sección: Color */}
          {availableColors.length > 0 && (
            <div className="border border-gray-100 rounded-2xl bg-[#FAFAFA] overflow-hidden">
              <button
                onClick={() => setIsColorOpen(!isColorOpen)}
                className="flex items-center justify-between w-full p-4 text-sm font-bold text-[#154734] uppercase tracking-wider bg-white hover:bg-gray-50 transition-colors"
              >
                <span>Color</span>
                <ChevronDown className={`w-4 h-4 text-[#C19A6B] transition-transform duration-300 ${isColorOpen ? "rotate-180" : ""}`} />
              </button>

              <div className={`transition-all duration-300 overflow-hidden ${isColorOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="p-4 bg-[#FAFAFA]">
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color) => {
                      const hex = color.hexCode.replace("#", "");
                      const isActive = activeColor === hex;
                      return (
                        <button
                          key={color.hexCode}
                          onClick={() => handleColorToggle(color.hexCode)}
                          title={color.name}
                          className={`w-9 h-9 rounded-full border-2 transition-all duration-200 shadow-sm hover:scale-110 active:scale-95 ${
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
            </div>
          )}

        </div>

        {/* Pie: Botón Aplicar */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <button
            onClick={onClose}
            className="w-full bg-[#154734] hover:bg-[#C19A6B] text-white text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl shadow-[0_10px_20px_-10px_rgba(21,71,52,0.5)] transition-all duration-300 active:scale-[0.98]"
          >
            Ver Resultados
          </button>
        </div>

      </div>
    </div>
  );
}
