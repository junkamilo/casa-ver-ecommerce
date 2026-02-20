"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import heroImage1 from "@/assets/hero-models.jpg";
// import heroImage2 from "@/assets/hero-models-2.jpg"; 

const BRAND_GREEN = "#154734";
const BRAND_GOLD  = "#C19A6B";

const SLIDES = [
  {
    id: "01",
    image: heroImage1,
    badge: "Nueva Colección",
    titleTop: "ACTITUD",
    titleBottom: "& Comodidad",
    description: "Moda activa para quien no se detiene.",
  },
  {
    id: "02",
    image: heroImage1, // Cambia esto por heroImage2 cuando la tengas
    badge: "Edición Limitada",
    titleTop: "ELEGANCIA",
    titleBottom: "& Frescura",
    description: "Siluetas diseñadas para destacar tu esencia.",
  }
];

const AUTOPLAY_TIME = 6000; 

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, AUTOPLAY_TIME);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[88vh] min-h-[540px] max-h-[980px] overflow-hidden select-none bg-black">

      {/* ══════════════════════════════════════════════
          IMÁGENES DEL CARRUSEL — Efecto Slide Lateral (NUEVO)
      ══════════════════════════════════════════════ */}
      <div 
        className="absolute inset-0 flex transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {SLIDES.map((slide, index) => (
          <div key={slide.id} className="relative w-full h-full shrink-0">
            <Image
              src={slide.image}
              alt={`Casa Verde — ${slide.badge}`}
              fill
              className="object-cover object-top"
              priority={index === 0} 
              placeholder="blur"
            />
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          CAPAS DE OVERLAY EDITORIAL
      ══════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(120deg, rgba(10,35,24,0.88) 0%, rgba(21,71,52,0.50) 38%, rgba(21,71,52,0.08) 65%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-2/3 z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(8,28,20,0.75) 0%, rgba(10,35,24,0.35) 40%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* ══════════════════════════════════════════════
          BORDES DORADOS
      ══════════════════════════════════════════════ */}
      <div
        className="absolute top-0 left-0 right-0 h-px z-20 animate-border-shimmer"
        style={{ background: `linear-gradient(90deg, transparent, ${BRAND_GOLD}, transparent)` }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px z-20"
        style={{ background: `linear-gradient(90deg, transparent, rgba(193,154,107,0.35), transparent)` }}
        aria-hidden="true"
      />

      {/* ══════════════════════════════════════════════
          TEXTO VERTICAL DE MARCA
      ══════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex absolute top-1/2 right-8 -translate-y-1/2 flex-col items-center gap-3 z-20 opacity-25"
        aria-hidden="true"
      >
        <div className="w-px h-10" style={{ background: BRAND_GOLD }} />
        <span
          className="text-[9px] font-black tracking-[0.55em] text-white uppercase"
          style={{ writingMode: "vertical-rl", letterSpacing: "0.5em" }}
        >
          CASA VERDE
        </span>
        <div className="w-px h-10" style={{ background: BRAND_GOLD }} />
      </div>

      {/* ══════════════════════════════════════════════
          NÚMERO EDITORIAL DINÁMICO
      ══════════════════════════════════════════════ */}
      <div
        className="hidden lg:block absolute bottom-16 right-20 text-[160px] font-black leading-none z-10 pointer-events-none select-none transition-opacity duration-500"
        style={{ color: "rgba(193,154,107,0.04)", fontFamily: "Georgia, serif" }}
        aria-hidden="true"
      >
        {SLIDES[currentSlide].id}
      </div>

      {/* ══════════════════════════════════════════════
          CONTENIDO PRINCIPAL DINÁMICO
      ══════════════════════════════════════════════ */}
      <div className="absolute inset-0 flex flex-col justify-end z-20 pointer-events-none">
        <div className="px-6 sm:px-12 lg:px-20 pb-24 sm:pb-28 max-w-2xl">
          
          <div>
            {/* ── Etiqueta de colección ── */}
            <div
              className="flex items-center gap-3 mb-5 opacity-0 animate-hero-in pointer-events-auto transition-all duration-500"
              style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
            >
              <span className="h-px w-8" style={{ background: BRAND_GOLD }} />
              <span className="text-[10px] font-black tracking-[0.38em] uppercase" style={{ color: BRAND_GOLD }}>
                {SLIDES[currentSlide].badge}
              </span>
              <span className="w-1 h-1 rotate-45 shrink-0" style={{ background: BRAND_GOLD }} />
            </div>

            {/* ── Titular ── */}
            <h1
              className="font-light text-white leading-[0.95] mb-4 opacity-0 animate-hero-in pointer-events-auto transition-all duration-500"
              style={{ fontFamily: "Georgia, serif", animationDelay: "280ms", animationFillMode: "forwards" }}
            >
              <span className="block text-[clamp(3.2rem,8vw,7rem)] tracking-[0.04em]">
                {SLIDES[currentSlide].titleTop}
              </span>
              <span className="block text-[clamp(2.4rem,6vw,5.5rem)] font-normal italic tracking-[0.06em]" style={{ color: BRAND_GOLD }}>
                {SLIDES[currentSlide].titleBottom}
              </span>
            </h1>

            {/* ── Descriptor ── */}
            <p
              className="text-sm sm:text-base text-white/55 tracking-[0.1em] mb-7 max-w-xs opacity-0 animate-hero-in pointer-events-auto transition-all duration-500"
              style={{ animationDelay: "480ms", animationFillMode: "forwards" }}
            >
              {SLIDES[currentSlide].description}
            </p>

            {/* ── Separador diamante ── */}
            <div
              className="flex items-center gap-4 mb-8 opacity-0 animate-hero-in pointer-events-auto"
              style={{ animationDelay: "580ms", animationFillMode: "forwards" }}
            >
              <div className="h-px w-14" style={{ background: `linear-gradient(to right, ${BRAND_GOLD}99, transparent)` }} />
              <div className="w-1.5 h-1.5 rotate-45 shrink-0 animate-diamond-breathe" style={{ background: BRAND_GOLD, boxShadow: `0 0 8px 1px rgba(193,154,107,0.6)` }} />
              <div className="h-px w-14" style={{ background: `linear-gradient(to left, ${BRAND_GOLD}99, transparent)` }} />
            </div>

            {/* ── Botones CTA ── */}
            <div
              className="flex flex-wrap items-center gap-4 sm:gap-6 opacity-0 animate-hero-in pointer-events-auto"
              style={{ animationDelay: "700ms", animationFillMode: "forwards" }}
            >
              <Link
                href="/tienda"
                className="group relative overflow-hidden px-7 py-3.5 text-[11px] font-black tracking-[0.32em] uppercase text-white transition-all duration-400 hover:shadow-[0_0_28px_rgba(193,154,107,0.28)] focus-visible:outline focus-visible:outline-[#C19A6B]"
                style={{ background: BRAND_GREEN }}
              >
                <span
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                  style={{ background: "linear-gradient(90deg, transparent 20%, rgba(193,154,107,0.22) 50%, transparent 80%)" }}
                />
                <span className="absolute inset-0 border border-transparent group-hover:border-[#C19A6B]/45 transition-colors duration-400" />
                <span className="relative">COMPRAR AHORA</span>
              </Link>

              <Link
                href="/tienda"
                className="group flex items-center gap-2.5 text-[11px] font-black tracking-[0.32em] uppercase text-white/65 hover:text-white transition-colors duration-300"
              >
                VER COLECCIÓN
                <span className="h-px w-5 bg-white/35 group-hover:w-9 group-hover:bg-[#C19A6B] transition-all duration-350 ease-out" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          INDICADORES DE SLIDE (Puntos interactivos)
      ══════════════════════════════════════════════ */}
      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`relative h-[2px] transition-all duration-500 overflow-hidden cursor-pointer ${
              index === currentSlide ? "w-10" : "w-4 hover:opacity-100 opacity-40"
            }`}
            style={{ background: index === currentSlide ? `rgba(193,154,107,0.22)` : "rgba(255,255,255,0.4)" }}
            aria-label={`Ir al slide ${index + 1}`}
          >
            {index === currentSlide && (
              <span
                key={currentSlide}
                className="absolute top-0 left-0 h-full w-full bg-[#C19A6B]"
                style={{
                  animation: `progress-fill ${AUTOPLAY_TIME}ms linear forwards`,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          INDICADOR DE SCROLL
      ══════════════════════════════════════════════ */}
      <div className="hidden sm:flex absolute bottom-8 right-10 flex-col items-center gap-2.5 z-20">
        <div className="relative w-px h-14 overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <span
            className="absolute left-0 w-full h-5 animate-scroll-line"
            style={{ background: `linear-gradient(to bottom, ${BRAND_GOLD}, transparent)` }}
          />
        </div>
        <span className="text-[8px] font-black uppercase text-white/30 tracking-[0.3em]" style={{ writingMode: "vertical-rl" }}>
          SCROLL
        </span>
      </div>

    </section>
  );
};

export default HeroSection;
