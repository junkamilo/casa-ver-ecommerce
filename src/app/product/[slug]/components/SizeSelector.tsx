"use client";

import { useState, useEffect } from "react";
import { X, Ruler } from "lucide-react";

interface Props {
  availableSizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
}

function SizeGuideModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Guía de tallas"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — ocupa casi toda la pantalla en móvil, ventana fija en desktop */}
      <div className="relative z-10 bg-white w-full sm:max-w-xl sm:mx-4 sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col h-[92dvh] sm:h-[88vh]">

        {/* Header fijo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-[#154734]" />
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#154734]">
              Guía de Tallas
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar guía de tallas"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo scrolleable */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-3 p-4">

            {/* Imagen 1: Tabla de tallas */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/Tallas.png"
              alt="Tabla de tallas Casa Verde"
              className="w-full h-auto block rounded-xl"
              loading="eager"
            />

            {/* Imagen 2: Cómo tomar medidas */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/MedidasTallas.png"
              alt="Cómo tomar tus medidas"
              className="w-full h-auto block rounded-xl"
              loading="lazy"
            />

            <p className="text-center text-xs text-gray-400 py-3">
              ¿Dudas sobre tu talla? Escríbenos al{" "}
              <a
                href="https://wa.me/573022457432"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#154734] font-semibold hover:text-[#C19A6B] transition-colors"
              >
                302 245 74 32
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SizeSelector({ availableSizes, selectedSize, onSelect }: Props) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
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

        {/* Botones de talla / estado agotado */}
        {availableSizes.length === 0 ? (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <p className="text-xs font-semibold text-red-500 uppercase tracking-[0.15em]">
              Color agotado — sin tallas disponibles
            </p>
          </div>
        ) : (
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
        )}

        {/* Trigger guía de tallas */}
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#154734]/70 hover:text-[#154734] transition-colors duration-200 group"
        >
          <Ruler className="w-3.5 h-3.5 text-[#C19A6B] group-hover:scale-110 transition-transform duration-200" />
          Guía de tallas
          <span className="h-px flex-1 bg-[#C19A6B]/30 group-hover:bg-[#C19A6B]/60 transition-colors duration-200 hidden sm:block" />
        </button>
      </div>

      {showGuide && <SizeGuideModal onClose={() => setShowGuide(false)} />}
    </>
  );
}
