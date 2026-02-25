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
    <section className={`relative py-20 px-4 sm:px-6 lg:px-8 ${config.bgColor} border-t border-[#C19A6B]/10 overflow-hidden`}>
      <div
        className={`absolute ${decorPositionClass} text-[200px] font-black leading-none text-black/[0.02] pointer-events-none select-none`}
        style={{ fontFamily: "Georgia, serif" }}
      >
        {config.decorNumber}
      </div>

      <div className="relative max-w-7xl mx-auto z-10">
        <SectionHeader config={config} />

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
            {items.map((item) => (
              <ProductCard key={item.slug} item={item} badgeVariant={config.badgeVariant} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
