"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { useCarousel } from "@/components/shared/ProductCarousel/hooks/useCarousel";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";

interface Props {
  products: CollectionProduct[];
}

export default function RecommendedProducts({ products }: Props) {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useCarousel();

  if (!products.length) return null;

  return (
    <section className="relative w-full bg-white overflow-hidden py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="relative max-w-7xl 2xl:max-w-6xl mx-auto">

        {/* Título — mismo estilo que BestSellers / NewCollection */}
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light text-[#154734] leading-tight mb-6 sm:mb-8 md:mb-10 lg:mb-12"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Sugerencias{" "}
          <span className="ml-1.5 sm:ml-2 md:ml-3">Exclusivas</span>
        </h2>

        <div className="relative mt-0">
          {/* Flecha izquierda */}
          <button
            onClick={() => scroll("left")}
            aria-label="Anterior"
            className={`
              hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20
              w-11 h-11 rounded-full bg-white border border-[#154734]/15 shadow-md
              items-center justify-center text-[#154734]
              hover:bg-[#154734] hover:text-white hover:border-[#154734]
              transition-all duration-200 active:scale-90
              ${canScrollLeft ? "opacity-100 -translate-x-5" : "opacity-0 pointer-events-none"}
            `}
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* Flecha derecha */}
          <button
            onClick={() => scroll("right")}
            aria-label="Siguiente"
            className={`
              hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20
              w-11 h-11 rounded-full bg-white border border-[#154734]/15 shadow-md
              items-center justify-center text-[#154734]
              hover:bg-[#154734] hover:text-white hover:border-[#154734]
              transition-all duration-200 active:scale-90
              ${canScrollRight ? "opacity-100 translate-x-5" : "opacity-0 pointer-events-none"}
            `}
          >
            <ChevronRight className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* Carrusel — misma clase exacta que BestSellers y NewCollection */}
          <div
            ref={scrollRef}
            className="grid grid-flow-col auto-cols-[80vw] sm:auto-cols-[45vw] md:auto-cols-[calc(25%-18px)] gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 md:pb-2 snap-x snap-mandatory"
            style={{ scrollBehavior: "smooth" }}
          >
            {products.map((item) => (
              <div key={item.slug} className="snap-start">
                <ProductCard item={item} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
