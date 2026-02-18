"use client";


import { useAutoScroll } from "./hooks/useAutoScroll";
import TestimonialCard from "./components/TestimonialCard";
import { TESTIMONIALS } from "./constants/constants";

const Testimonials = () => {
  const { scrollRef, setIsPaused } = useAutoScroll();
  const items = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-350 mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-10 uppercase tracking-wider">
          Lo que dicen nuestras clientas
        </h2>

        <div className="relative">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-linear-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-linear-to-l from-background to-transparent z-10" />

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {items.map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
