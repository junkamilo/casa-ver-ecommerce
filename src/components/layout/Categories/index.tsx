"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { useCarousel } from "./hooks/useCarousel";
import { useCategories } from "./hooks/useCategories";
import CategoryCard from "./components/CategoryCard";
import CategoryCarouselSkeleton from "@/components/ui/skeletons/CategoryCarouselSkeleton";

const BRAND_GOLD = "#C19A6B";

const Categories = () => {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useCarousel();
  const { categories, loading } = useCategories();

  return (
    <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-[#FAFAFA] border-t border-[#C19A6B]/10 overflow-hidden">

      <div className="relative max-w-7xl 2xl:max-w-6xl mx-auto z-10">

        {/* ── Encabezado reutilizable ── */}
        <SectionHeader
          title="Explora por"
          titleItalic="Categoría"
          href="/collections"
          linkText="VER TODO"
          textColor="text-[#154734]"
          hoverColor="hover:text-[#C19A6B]"
          fontClass="font-light"
        />

        <div className="relative group/carousel mt-8 sm:mt-10 md:mt-12">

          {loading && <CategoryCarouselSkeleton count={4} />}

          {!loading && categories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <span
                className="w-6 h-6 rounded-full border-2 border-[#C19A6B]/40 border-t-[#C19A6B] animate-spin"
                aria-hidden="true"
              />
              <p className="italic text-sm text-[#C19A6B]/80 text-center">
                Pronto agregaremos nuevas categorías y colecciones.
              </p>
            </div>
          )}

          {!loading && categories.length > 0 && (
            <>
              {canScrollLeft && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    scroll("left");
                  }}
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-100 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-[#154734]/10 items-center justify-center text-[#154734] hover:bg-[#154734] hover:text-white transition-all duration-400 shadow-xl opacity-0 -translate-x-4 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0 cursor-pointer touch-target active:scale-90"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[1.5]" />
                </button>
              )}

              {canScrollRight && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    scroll("right");
                  }}
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-100 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-[#154734]/10 items-center justify-center text-[#154734] hover:bg-[#154734] hover:text-white transition-all duration-400 shadow-xl opacity-0 translate-x-4 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0 cursor-pointer touch-target active:scale-90"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-6 h-6 stroke-[1.5]" />
                </button>
              )}

              <div
                ref={scrollRef}
                className="grid grid-flow-col auto-cols-[80vw] sm:auto-cols-[50vw] gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 sm:pb-6 snap-x snap-mandatory md:grid-flow-row md:auto-cols-auto md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 md:gap-6 md:overflow-visible md:pb-0 md:snap-none"
                style={{ scrollBehavior: "smooth" }}
              >
                {categories.map((cat) => (
                  <div key={cat.id} className="snap-center md:snap-none">
                    <CategoryCard
                      image={cat.image ?? ""}
                      label={cat.name}
                      slug={cat.slug}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </section>
  );
};

export default Categories;
