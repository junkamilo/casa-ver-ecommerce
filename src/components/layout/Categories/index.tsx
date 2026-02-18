"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES } from "./constants/constants";
import { useCarousel } from "./hooks/useCarousel";
import CategoryCard from "./components/CategoryCard";

const Categories = () => {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useCarousel();

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold tracking-wider text-foreground uppercase">
          CATEGORÍAS
        </h2>
        <Link
          href="/collections"
          className="group flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-brand transition-colors"
        >
          Ver todo
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* --- CARRUSEL --- */}
      <div className="relative max-w-7xl mx-auto group/carousel">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-2 sm:-ml-3 w-9 h-9 sm:w-10 sm:h-10 bg-background/90 border border-border rounded-full flex items-center justify-center shadow-md hover:bg-background transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-2 sm:-mr-3 w-9 h-9 sm:w-10 sm:h-10 bg-background/90 border border-border rounded-full flex items-center justify-center shadow-md hover:bg-background transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        )}

        {/* Contenedor scrollable */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide"
        >
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={i} {...cat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
