"use client";

import { ProductItem, SectionConfig } from "./types";
import { useCarousel } from "./hooks/useCarousel";
import SectionHeader from "./components/SectionHeader";
import CarouselArrow from "./components/CarouselArrow";
import ProductCard from "./components/ProductCard";

interface ProductCarouselProps {
  config: SectionConfig;
  items: ProductItem[];
}

const ProductCarousel = ({ config, items }: ProductCarouselProps) => {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useCarousel();

  const decorPositionClass =
    config.decorAlign === "right"
      ? "top-0 right-0 -translate-y-1/4 translate-x-1/4"
      : "top-10 left-0 -translate-x-1/4";

  return (
    <section className={`relative w-full py-12 sm:py-16 md:py-20 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 ${config.bgColor} border-t border-[#C19A6B]/10 overflow-hidden`}>
      <div
        className={`absolute ${decorPositionClass} text-[120px] sm:text-[160px] md:text-[200px] font-black leading-none text-black/[0.02] pointer-events-none select-none`}
        style={{ fontFamily: "Georgia, serif" }}
      >
      </div>

      <div className="relative max-w-7xl 2xl:max-w-6xl mx-auto z-10">
        <SectionHeader config={config} />

        <div className="relative mt-10 sm:mt-12 md:mt-12 lg:mt-12 group/carousel">
          {canScrollLeft && (
            <CarouselArrow direction="left" onClick={() => scroll("left")} />
          )}
          {canScrollRight && (
            <CarouselArrow direction="right" onClick={() => scroll("right")} />
          )}

          <div
            ref={scrollRef}
            className="grid grid-flow-col auto-cols-[80vw] sm:auto-cols-[45vw] gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 sm:pb-6 snap-x snap-mandatory md:grid-flow-row md:auto-cols-auto md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 md:gap-6 md:overflow-visible md:pb-0 md:snap-none"
            style={{ scrollBehavior: "smooth" }}
          >
            {items.map((item) => (
              <div key={item.slug} className="snap-center md:snap-none">
                <ProductCard item={item} badgeVariant={config.badgeVariant} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
