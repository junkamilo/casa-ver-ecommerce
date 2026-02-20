"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES } from "./constants/constants"; // Ajusta tu ruta
import { useCarousel } from "./hooks/useCarousel"; // Ajusta tu ruta
import CategoryCard from "./components/CategoryCard"; // Ajusta tu ruta

const BRAND_GOLD = "#C19A6B";
const BRAND_GREEN = "#154734";

const Categories = () => {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useCarousel();

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] border-t border-[#C19A6B]/10 overflow-hidden">

      {/* Detalle de fondo sutil: Número Editorial 04 */}
      <div className="absolute top-10 right-0 text-[180px] font-black leading-none text-[#154734]/[0.02] translate-x-1/4 pointer-events-none select-none" style={{ fontFamily: "Georgia, serif" }}>
        04
      </div>

      <div className="relative max-w-7xl mx-auto z-10">

        {/* ── HEADER EDITORIAL ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 w-full mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-8" style={{ background: BRAND_GOLD }} />
              <span className="text-[10px] font-black tracking-[0.38em] uppercase text-[#C19A6B]">
                Nuestros Estilos
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-light text-[#154734] leading-none" style={{ fontFamily: "Georgia, serif" }}>
              Explora por <span className="italic" style={{ color: BRAND_GOLD }}>Categoría</span>
            </h2>
          </div>

          <Link
            href="/collections"
            className="group flex items-center gap-2.5 text-[11px] font-black tracking-[0.32em] uppercase text-[#154734] hover:text-[#C19A6B] transition-colors duration-300 pb-2"
          >
            VER TODO
            <span className="h-px w-5 bg-[#154734]/30 group-hover:w-9 group-hover:bg-[#C19A6B] transition-all duration-350 ease-out" />
          </Link>
        </div>

        {/* ── CARRUSEL ── */}
        <div className="relative group/carousel mt-12">

          {/* BOTÓN IZQUIERDO */}
          {canScrollLeft && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scroll("left");
              }}
              // 🔥 SOLUCIÓN AQUÍ: z-[100], left-4 (para que no se corte), y -translate-x-4 para una entrada elegante
              className="absolute left-4 top-1/2 -translate-y-1/2 z-[100] w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-[#154734]/10 flex items-center justify-center text-[#154734] hover:bg-[#154734] hover:text-white transition-all duration-400 shadow-xl opacity-0 -translate-x-4 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0 cursor-pointer"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6 stroke-[1.5]" />
            </button>
          )}

          {/* BOTÓN DERECHO */}
          {canScrollRight && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scroll("right");
              }}
              // 🔥 SOLUCIÓN AQUÍ: z-[100], right-4, y translate-x-4
              className="absolute right-4 top-1/2 -translate-y-1/2 z-[100] w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-[#154734]/10 flex items-center justify-center text-[#154734] hover:bg-[#154734] hover:text-white transition-all duration-400 shadow-xl opacity-0 translate-x-4 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0 cursor-pointer"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-6 h-6 stroke-[1.5]" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-8 px-1"
            style={{ scrollBehavior: "smooth" }}
          >
            {CATEGORIES.map((cat, i) => (
              <CategoryCard key={i} {...cat} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Categories;
