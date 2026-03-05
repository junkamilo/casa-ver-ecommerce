// 1. Reemplaza tu componente Testimonials.tsx con este código:

"use client";

import { MessageSquare, Sparkles } from "lucide-react";
import { useAutoScroll } from "./hooks/useAutoScroll";
import TestimonialCard from "./components/TestimonialCard";
import { TESTIMONIALS } from "./constants/constants";
import { TestimonialItem } from "./types/types";

interface Props {
  comments?: TestimonialItem[];
}

const Testimonials = ({ comments }: Props) => {
  const { scrollRef, setIsPaused } = useAutoScroll();
  const items = comments ?? TESTIMONIALS;
  const doubled = items.length >= 4 ? [...items, ...items] : items;

  return (
    <section className="mx-4 sm:mx-6 lg:mx-8 xl:mx-12 relative rounded-[2.5rem] sm:rounded-[3rem] p-[3px] sm:p-[4px] overflow-hidden group shadow-[0_20px_50px_-15px_rgba(21,71,52,0.3)] hover:shadow-[0_30px_60px_-15px_rgba(21,71,52,0.4)] transition-shadow duration-700">
      
      {/* Borde Animado Giratorio (Verde y Dorado) */}
      <div className="absolute top-1/2 left-1/2 w-[250%] h-[250%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0%,#154734_20%,#C19A6B_40%,transparent_50%,transparent_50%,#154734_70%,#C19A6B_90%,transparent_100%)] animate-[spin_5s_linear_infinite] opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Contenedor Principal Interno */}
      <div className="relative z-10 w-full h-full bg-[#FAFAFA] rounded-[calc(2.5rem-3px)] sm:rounded-[calc(3rem-4px)] py-16 sm:py-24 overflow-hidden isolate">
        
        {/* Fondo decorativo sutil */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: "radial-gradient(#154734 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }} 
        />

        {/* Cabecera editorial */}
        <div className="flex flex-col items-center justify-center mb-16 sm:mb-20 px-6 relative z-20">
          <div className="flex items-center gap-4 mb-5">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#C19A6B]" />
            <span className="text-[10px] sm:text-xs font-black tracking-[0.4em] uppercase text-[#C19A6B] flex items-center gap-2 drop-shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Comunidad
            </span>
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#C19A6B]" />
          </div>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl text-[#154734] text-center tracking-tight leading-[1.1]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Lo que dicen <span className="italic text-[#C19A6B]">nuestras clientas</span>
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] max-w-2xl mx-auto hover:shadow-[0_20px_50px_-15px_rgba(193,154,107,0.15)] transition-all duration-500 ease-out relative z-20">
            <div className="w-20 h-20 rounded-full bg-[#FAFAFA] flex items-center justify-center mb-8 shadow-inner border border-gray-50 hover:scale-110 transition-transform duration-500 ease-in-out">
              <MessageSquare className="w-8 h-8 text-[#C19A6B]" strokeWidth={1.2} />
            </div>
            <p className="text-sm sm:text-base text-gray-500 font-light max-w-md leading-relaxed">
              Aún no hay comentarios para esta prenda.
              <span className="block mt-3 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#154734]">
                ¡Sé la primera en opinar!
              </span>
            </p>
          </div>
        ) : (
          <div className="relative -mx-2 sm:-mx-6 lg:-mx-8">
            {/* Overlay para difuminar los bordes (Efecto infinito sobre el fondo gris claro) */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 lg:w-48 bg-gradient-to-r from-[#FAFAFA] to-transparent z-20" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 lg:w-48 bg-gradient-to-l from-[#FAFAFA] to-transparent z-20" />

            {/* Contenedor con Scroll */}
            <div
              ref={scrollRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide py-10 px-8 sm:px-16 lg:px-32 relative z-10"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {doubled.map((t, i) => (
                <div 
                  key={i} 
                  className="shrink-0 w-[280px] sm:w-[340px]"
                >
                  <TestimonialCard {...t} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;