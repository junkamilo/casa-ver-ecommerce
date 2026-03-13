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
    <section className="mx-3 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 2xl:mx-auto 2xl:max-w-7xl relative rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] p-[2px] overflow-hidden group shadow-[0_15px_40px_-15px_rgba(21,71,52,0.15)] hover:shadow-[0_20px_50px_-15px_rgba(193,154,107,0.25)] transition-shadow duration-700 mb-12 sm:mb-16">

      <div className="absolute top-1/2 left-1/2 w-[250%] h-[250%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0%,#154734_20%,#C19A6B_40%,transparent_50%,transparent_50%,#154734_70%,#C19A6B_90%,transparent_100%)] animate-[spin_6s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10 w-full h-full bg-[#F2EAE0] rounded-2xl sm:rounded-[calc(2rem-2px)] lg:rounded-[calc(2.5rem-2px)] py-8 sm:py-12 lg:py-16 overflow-hidden isolate">

        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#C19A6B 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }}
        />

        <div className="flex flex-col items-center justify-center mb-8 sm:mb-10 lg:mb-14 px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="h-px w-6 sm:w-8 lg:w-12 bg-gradient-to-r from-transparent to-[#C19A6B]" />
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-black tracking-[0.3em] uppercase text-[#C19A6B] flex items-center gap-1 sm:gap-1.5 drop-shadow-sm">
              <Sparkles className="w-3 h-3" />
              Comunidad
            </span>
            <span className="h-px w-6 sm:w-8 lg:w-12 bg-gradient-to-l from-transparent to-[#C19A6B]" />
          </div>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-[#154734] text-center tracking-tight leading-[1.1]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Lo que dicen <span className="italic text-[#C19A6B]">nuestras clientas</span>
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 text-center bg-white border border-[#C19A6B]/20 rounded-2xl sm:rounded-[2rem] shadow-sm max-w-xl mx-auto relative z-20">
            <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-[#FAFAFA] flex items-center justify-center mb-4 sm:mb-6 shadow-inner border border-gray-50">
              <MessageSquare className="w-5 sm:w-6 h-5 sm:h-6 text-[#C19A6B]" strokeWidth={1.2} />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-light max-w-md leading-relaxed">
              Aún no hay comentarios para esta prenda.
              <span className="block mt-2 text-[8px] sm:text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-[#154734]">
                ¡Sé la primera en opinar!
              </span>
            </p>
          </div>
        ) : (
          <div className="relative -mx-2 sm:-mx-4 lg:-mx-8">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 lg:w-24 xl:w-32 bg-gradient-to-r from-[#F2EAE0] to-transparent z-20" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 lg:w-24 xl:w-32 bg-gradient-to-l from-[#F2EAE0] to-transparent z-20" />

            <div
              ref={scrollRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide py-4 sm:py-6 px-4 sm:px-8 lg:px-16 xl:px-24 relative z-10 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {doubled.map((t, i) => (
                <div
                  key={i}
                  className="shrink-0 w-[220px] sm:w-[260px] lg:w-[280px] snap-center"
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