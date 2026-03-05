"use client";

import { ALL_SIZES } from "../constants";

interface Props {
  availableSizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
}

export default function SizeSelector({ availableSizes, selectedSize, onSelect }: Props) {
  return (
    <div>
      {/* Etiqueta editorial y guía de tallas */}
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
          Talla Seleccionada
        </span>
        <div className="flex items-center gap-3">
          <span
            className="text-base sm:text-lg text-[#154734] italic font-medium transition-all duration-300"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {selectedSize || "Elige una talla"}
          </span>
        </div>
      </div>

      {/* Botones de talla */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {ALL_SIZES.map((size) => {
          const available = availableSizes.includes(size);
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              onClick={() => available && onSelect(size)}
              disabled={!available}
              aria-label={`Seleccionar talla ${size}`}
              aria-pressed={isSelected}
              className={`relative min-w-14 h-12 px-4 rounded-xl border text-sm font-bold tracking-widest transition-all duration-300 ease-out overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] focus-visible:ring-offset-2 ${
                isSelected
                  ? "border-[#154734] bg-[#154734] text-white shadow-md scale-105"
                  : available
                  ? "border-gray-200 bg-white text-gray-600 hover:border-[#C19A6B] hover:text-[#154734] hover:shadow-sm"
                  : "border-gray-100 bg-[#FAFAFA] text-gray-300 cursor-not-allowed"
              }`}
            >
              <span className="relative z-10">{size}</span>

              {/* Línea diagonal "Agotado" */}
              {!available && (
                <svg
                  className="absolute inset-0 w-full h-full text-gray-200 z-0 pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
