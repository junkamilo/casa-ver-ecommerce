"use client";

import Image from "next/image";
import { ProductVariant } from "../types";

interface Props {
  variants: ProductVariant[];
  activeIndex: number;
  currentType: string;
  onSelect: (index: number) => void;
}

export default function VariantSelector({
  variants,
  activeIndex,
  currentType,
  onSelect,
}: Props) {
  return (
    <div className="mb-8">
      {/* 1. Etiqueta Editorial */}
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
          Estilo Seleccionado
        </span>
        <span 
          className="text-base sm:text-lg text-[#154734] italic font-medium transition-all duration-300 capitalize"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {currentType || "Elige un estilo"}
        </span>
      </div>

      {/* 2. Contenedor de Tarjetas de Variante */}
      <div className="flex flex-wrap gap-3 sm:gap-4">
        {variants.map((v, i) => {
          const isSelected = activeIndex === i;

          return (
            <button
              key={v.type}
              onClick={() => onSelect(i)}
              aria-label={`Seleccionar estilo ${v.type}`}
              className={`relative flex items-center gap-3 p-1.5 pr-5 rounded-xl border transition-all duration-300 ease-out group outline-none ${
                isSelected
                  ? "border-[#154734] bg-white shadow-md ring-1 ring-[#154734]"
                  : "border-gray-200 bg-[#FAFAFA] hover:border-[#C19A6B] hover:bg-white hover:shadow-sm"
              }`}
            >
              {/* Contenedor de la mini-foto */}
              <div 
                className={`relative w-10 h-12 sm:w-12 sm:h-14 rounded-lg overflow-hidden shrink-0 transition-all duration-500 ${
                  isSelected 
                    ? "opacity-100 grayscale-0" 
                    : "opacity-70 grayscale-[30%] group-hover:opacity-100 group-hover:grayscale-0"
                }`}
              >
                <Image 
                  src={v.gallery[0]} 
                  alt={`Vista previa de ${v.type}`} 
                  fill 
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                  sizes="48px"
                />
              </div>

              {/* Nombre de la variante */}
              <span 
                className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                  isSelected 
                    ? "text-[#154734]" 
                    : "text-gray-500 group-hover:text-[#C19A6B]"
                }`}
              >
                {v.type}
              </span>

              {/* Checkmark sutil para la opción seleccionada */}
              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#154734] border-2 border-white shadow-sm">
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
