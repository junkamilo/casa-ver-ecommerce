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
    <section className="mx-4 sm:mx-6 lg:mx-8 xl:mx-12 relative rounded-[2rem] sm:rounded-[2.5rem] p-[2px] overflow-hidden group shadow-[0_15px_40px_-15px_rgba(21,71,52,0.15)] hover:shadow-[0_20px_50px_-15px_rgba(193,154,107,0.25)] transition-shadow duration-700 mb-16">
      
      {/* Borde Animado Giratorio (Más sutil) */}
      <div className="absolute top-1/2 left-1/2 w-[250%] h-[250%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0%,#154734_20%,#C19A6B_40%,transparent_50%,transparent_50%,#154734_70%,#C19A6B_90%,transparent_100%)] animate-[spin_6s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* 🟢 AQUÍ ESTÁ EL CAMBIO CLAVE: bg-[#F2EAE0] (Beige Champagne notable) */}
      <div className="relative z-10 w-full h-full bg-[#F2EAE0] rounded-[calc(2rem-2px)] sm:rounded-[calc(2.5rem-2px)] py-12 sm:py-16 overflow-hidden isolate">
        
        {/* Fondo decorativo sutil (Puntos dorados muy claros) */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none" 
          style={{ backgroundImage: "radial-gradient(#C19A6B 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }} 
        />

        {/* Cabecera editorial */}
        <div className="flex flex-col items-center justify-center mb-10 sm:mb-14 px-6 relative z-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#C19A6B]" />
            <span className="text-[9px] sm:text-[10px] font-black tracking-[0.3em] uppercase text-[#C19A6B] flex items-center gap-1.5 drop-shadow-sm">
              <Sparkles className="w-3 h-3" />
              Comunidad
            </span>
            <span className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#C19A6B]" />
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl text-[#154734] text-center tracking-tight leading-[1.1]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Lo que dicen <span className="italic text-[#C19A6B]">nuestras clientas</span>
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white border border-[#C19A6B]/20 rounded-[2rem] shadow-sm max-w-xl mx-auto relative z-20">
            <div className="w-16 h-16 rounded-full bg-[#FAFAFA] flex items-center justify-center mb-6 shadow-inner border border-gray-50">
              <MessageSquare className="w-6 h-6 text-[#C19A6B]" strokeWidth={1.2} />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-light max-w-md leading-relaxed">
              Aún no hay comentarios para esta prenda.
              <span className="block mt-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#154734]">
                ¡Sé la primera en opinar!
              </span>
            </p>
          </div>
        ) : (
          <div className="relative -mx-2 sm:-mx-6 lg:-mx-8">
            {/* 🟢 Difuminado lateral actualizado al nuevo color Beige (#F2EAE0) */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 lg:w-32 bg-gradient-to-r from-[#F2EAE0] to-transparent z-20" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 lg:w-32 bg-gradient-to-l from-[#F2EAE0] to-transparent z-20" />

            {/* Contenedor con Scroll */}
            <div
              ref={scrollRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-6 px-8 sm:px-16 lg:px-24 relative z-10"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {doubled.map((t, i) => (
                <div 
                  key={i} 
                  className="shrink-0 w-[240px] sm:w-[280px]" // Ancho reducido para no agotar la vista
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