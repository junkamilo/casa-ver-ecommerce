"use client";

import { MessageSquare, Sparkles } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import TestimonialCard from "./components/TestimonialCard";
import { SEED_TESTIMONIALS } from "./constants/constants";
import { TestimonialItem } from "./types/types";
import { useEffect, useRef } from "react";

interface Props {
  comments?: TestimonialItem[];
}

const Testimonials = ({ comments }: Props) => {
  const autoplayRef = useRef<ReturnType<typeof Autoplay> | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      slidesToScroll: 1,
      breakpoints: {
        "(max-width: 768px)": { slidesToScroll: 1 },
        "(min-width: 769px) and (max-width: 1024px)": { slidesToScroll: 1 },
        "(min-width: 1025px)": { slidesToScroll: 1 },
      },
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const items = comments ?? SEED_TESTIMONIALS;

  useEffect(() => {
    if (!emblaApi) return;

    // Obtener la instancia del plugin Autoplay
    if (emblaApi.plugins) {
      const autoplay = emblaApi.plugins().autoplay;
      if (autoplay) {
        autoplayRef.current = autoplay;
      }
    }
  }, [emblaApi]);

  const handleMouseEnter = () => {
    if (autoplayRef.current?.stop) {
      autoplayRef.current.stop();
    }
  };

  const handleMouseLeave = () => {
    if (autoplayRef.current?.play) {
      autoplayRef.current.play();
    }
  };

  return (
    <section className="mx-3 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 2xl:mx-auto 2xl:max-w-7xl relative rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden mb-12 sm:mb-16">

      <div className="relative w-full h-full bg-[#F2EAE0] rounded-2xl sm:rounded-4xl lg:rounded-[2.5rem] py-8 sm:py-12 lg:py-16 overflow-hidden isolate">

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
            Lo que dicen nuestras clientas
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="relative z-20 mx-3 sm:mx-auto sm:max-w-sm">
            <div className="flex flex-col items-center justify-center py-7 sm:py-12 px-5 sm:px-8 text-center bg-white border border-[#C19A6B]/20 rounded-2xl sm:rounded-[2rem] shadow-sm overflow-hidden">
              {/* Decoración de fondo */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: "radial-gradient(#154734 1px, transparent 1px)", backgroundSize: "20px 20px" }}
              />
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#F2EAE0] flex items-center justify-center mb-4 sm:mb-5 shadow-inner border border-[#C19A6B]/15 relative z-10">
                <MessageSquare className="w-5 sm:w-6 h-5 sm:h-6 text-[#C19A6B]" strokeWidth={1.2} />
              </div>
              <p className="text-sm sm:text-base text-[#154734] font-light leading-relaxed relative z-10" style={{ fontFamily: "Georgia, serif" }}>
                Aún no hay comentarios para esta prenda.
              </p>
              <span className="block mt-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-[#C19A6B] relative z-10">
                ¡Sé la primera en opinar!
              </span>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {/* Gradientes laterales para fade effect */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-12 md:w-16 lg:w-24 bg-gradient-to-r from-[#F2EAE0] to-transparent z-20" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-12 md:w-16 lg:w-24 bg-gradient-to-l from-[#F2EAE0] to-transparent z-20" />

            {/* Contenedor Embla - Carrusel */}
            <div className="overflow-hidden cursor-grab active:cursor-grabbing select-none" ref={emblaRef}>
              <div className="flex gap-3 sm:gap-4 lg:gap-6 py-4 sm:py-6 px-3 sm:px-6 lg:px-12">
                {items.map((testimonial, index) => (
                  <div
                    key={index}
                    className="flex-[0_0_78%] sm:flex-[0_0_50%] md:flex-[0_0_40%] lg:flex-[0_0_33.333%] min-w-0"
                  >
                    <TestimonialCard {...testimonial} />
                  </div>
                ))}
              </div>
            </div>

            {/* Indicador de scroll en móvil */}
            <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
              {items.map((_, index) => (
                <div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full bg-[#C19A6B]/30"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;