"use client";


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
      <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 scrollbar-hide sm:flex-wrap sm:overflow-x-visible sm:pb-0 sm:gap-3">
        {availableSizes.map((size) => {
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              onClick={() => onSelect(size)}
              aria-label={`Seleccionar talla ${size}`}
              aria-pressed={isSelected}
              className={`shrink-0 min-w-14 h-12 px-4 rounded-xl border text-sm font-bold tracking-widest transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] focus-visible:ring-offset-2 ${
                isSelected
                  ? "border-[#154734] bg-[#154734] text-white shadow-md scale-105"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#C19A6B] hover:text-[#154734] hover:shadow-sm"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
