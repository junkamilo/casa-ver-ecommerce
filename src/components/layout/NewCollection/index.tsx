"use client";

import { items } from "./data";
import { useCarousel } from "./hooks/useCarousel";
import SectionHeader from "./components/SectionHeader";
import CarouselArrow from "./components/CarouselArrow";
import CollectionCard from "./components/CollectionCard";

const NewCollection = () => {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useCarousel();

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#C19A6B]/10 overflow-hidden">
      {/* Detalle de fondo sutil: Número Editorial 03 */}
      <div className="absolute top-10 left-0 text-[180px] font-black leading-none text-[#154734]/[0.02] -translate-x-1/4 pointer-events-none select-none" style={{ fontFamily: "Georgia, serif" }}>
        03
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
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-10 px-1"
            style={{ scrollBehavior: "smooth" }}
          >
            {items.map((item) => (
              <CollectionCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewCollection;
