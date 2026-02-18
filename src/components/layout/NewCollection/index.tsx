"use client";

import { items } from "./data";
import { useCarousel } from "./hooks/useCarousel";
import SectionHeader from "./components/SectionHeader";
import CarouselArrow from "./components/CarouselArrow";
import CollectionCard from "./components/CollectionCard";

const NewCollection = () => {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useCarousel();

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <SectionHeader />

      <div className="relative max-w-7xl mx-auto">
        {canScrollLeft && (
          <CarouselArrow direction="left" onClick={() => scroll("left")} />
        )}
        {canScrollRight && (
          <CarouselArrow direction="right" onClick={() => scroll("right")} />
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide"
        >
          {items.map((item) => (
            <CollectionCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewCollection;
