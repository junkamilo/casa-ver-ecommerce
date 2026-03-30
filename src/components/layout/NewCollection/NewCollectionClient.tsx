"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import ProductCard from "@/components/ui/ProductCard";
import { useCarousel } from "@/components/shared/ProductCarousel/hooks/useCarousel";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";

const BRAND_GOLD = "#C19A6B";
const BRAND_GREEN = "#154734";

interface NewCollectionClientProps {
  items: CollectionProduct[];
}

const NewCollectionClient = ({ items }: NewCollectionClientProps) => {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useCarousel();

  return (
    <section className="relative w-full bg-white border-t border-[#C19A6B]/10 overflow-hidden py-12 sm:py-16 md:py-20 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="relative max-w-7xl 2xl:max-w-6xl mx-auto z-10">
        <SectionHeader
          title="Nuevos"
          titleItalic="Ingresos"
          href="/collections/nueva-coleccion"
          linkText="VER TODO"
          textColor={`text-${BRAND_GREEN}`}
          hoverColor={`hover:text-${BRAND_GOLD}`}
          fontClass="font-light"
        />

        {items.length === 0 && (
          <SectionEmptyState message="Pronto agregaremos nuevos ingresos." />
        )}

        <div className="relative mt-10 sm:mt-12 group/carousel">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-[#154734]/10 items-center justify-center text-[#154734] hover:bg-[#154734] hover:text-white transition-all duration-400 shadow-xl opacity-0 -translate-x-4 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0 cursor-pointer active:scale-90"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6 stroke-[1.5]" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-[#154734]/10 items-center justify-center text-[#154734] hover:bg-[#154734] hover:text-white transition-all duration-400 shadow-xl opacity-0 translate-x-4 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0 cursor-pointer active:scale-90"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-6 h-6 stroke-[1.5]" />
            </button>
          )}

          {items.length > 0 && (
            <div
              ref={scrollRef}
              className="grid grid-flow-col auto-cols-[80vw] sm:auto-cols-[45vw] gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 sm:pb-6 snap-x snap-mandatory md:grid-flow-row md:auto-cols-auto md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 md:gap-6 md:overflow-visible md:pb-0 md:snap-none"
              style={{ scrollBehavior: "smooth" }}
            >
              {items.map((item) => (
                <div key={item.slug} className="snap-center md:snap-none">
                  <ProductCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewCollectionClient;
