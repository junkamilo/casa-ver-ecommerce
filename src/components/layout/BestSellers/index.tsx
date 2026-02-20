"use client";

import { products } from "./data";
import { useCarousel } from "./hooks/useCarousel";
import SectionHeader from "./components/SectionHeader";
import CarouselArrow from "./components/CarouselArrow";
import ProductCard from "./components/ProductCard";

const BestSellers = () => {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useCarousel();

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] border-t border-[#C19A6B]/10 overflow-hidden">
      {/* Detalle de fondo sutil */}
      <div className="absolute top-0 right-0 text-[200px] font-black leading-none text-black/[0.02] -translate-y-1/4 translate-x-1/4 pointer-events-none select-none" style={{ fontFamily: "Georgia, serif" }}>
        02
      </div>

      <div className="relative max-w-7xl mx-auto z-10">
        <SectionHeader />

        <div className="relative mt-12 group/carousel">
          {canScrollLeft && (
            <CarouselArrow direction="left" onClick={() => scroll("left")} />
          )}
          {canScrollRight && (
            <CarouselArrow direction="right" onClick={() => scroll("right")} />
          )}

          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-8 px-1"
            style={{ scrollBehavior: "smooth" }}
          >
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
