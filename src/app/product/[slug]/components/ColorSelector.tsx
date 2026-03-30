"use client";

import { UIColor } from "../types";

interface Props {
  colors: UIColor[];
  selected: UIColor | null;
  onSelect: (color: UIColor) => void;
}

export default function ColorSelector({ colors, selected, onSelect }: Props) {
  return (
    <div>
      {/* Etiqueta editorial */}
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
          Tono Seleccionado
        </span>
        <span
          className="text-base sm:text-lg text-[#154734] italic capitalize transition-all duration-300"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {selected?.name ?? "Elige un tono"}
        </span>
      </div>

      {/* Muestras */}
      <div className="flex flex-nowrap overflow-x-auto gap-4 py-3 px-3 scrollbar-hide sm:flex-wrap sm:overflow-x-visible sm:py-0 sm:px-0 sm:gap-5">
        {colors.map((color) => {
          const isSelected = selected?.id === color.id;
          return (
            <button
              key={color.id}
              onClick={() => onSelect(color)}
              aria-label={`Seleccionar color ${color.name}`}
              aria-pressed={isSelected}
              className="relative flex items-center justify-center group outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] focus-visible:ring-offset-2 rounded-full"
            >
              {/* Anillo de selección animado */}
              <span
                className={`absolute inset-0 rounded-full border transition-all duration-500 ease-out ${
                  isSelected
                    ? "border-[#C19A6B] scale-[1.35] opacity-100"
                    : "border-transparent scale-100 opacity-0 group-hover:scale-[1.2] group-hover:border-gray-300 group-hover:opacity-100"
                }`}
              />
              {/* Círculo de color */}
              <span
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-inner transition-transform duration-300 ${
                  isSelected ? "scale-100" : "scale-95 group-hover:scale-100"
                }`}
                style={{
                  backgroundColor: color.hex,
                  border:
                    color.hex.toLowerCase() === "#ffffff"
                      ? "1px solid #E5E7EB"
                      : "1px solid rgba(0,0,0,0.06)",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
