"use client";

import { Star } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

const testimonials = [
  {
    rating: 5,
    text: "Son muy tesas 👏",
    name: "Alejandra Chalarca",
  },
  {
    rating: 5,
    text: "Amo a amatto 😍 😍",
    name: "Vanessa M",
  },
  {
    rating: 5,
    text: "Es perfecta la horma, la calidad se siente, las prendas son demasiado cómodas",
    name: "Laura Villa",
  },
  {
    rating: 5,
    text: "Es perfecta la horma, la calidad se siente, las prendas son demasiado cómodas",
    name: "Laura Villa",
  },
  {
    rating: 5,
    text: "Es perfecta la horma, la calidad se siente, las prendas son demasiado cómodas",
    name: "Laura Villa",
  },
  {
    rating: 5,
    text: "Es perfecta la horma, la calidad se siente, las prendas son demasiado cómodas",
    name: "Laura Villa",
  },
];

const SCROLL_SPEED = 0.5; // px per frame

const Testimonials = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>(0);

  // Duplicate testimonials for seamless infinite loop
  const items = [...testimonials, ...testimonials];

  const animate = useCallback(() => {
    const container = scrollRef.current;
    if (!container || isPaused) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    container.scrollLeft += SCROLL_SPEED;

    // When we've scrolled past the first set, reset to the beginning seamlessly
    const halfScroll = container.scrollWidth / 2;
    if (container.scrollLeft >= halfScroll) {
      container.scrollLeft -= halfScroll;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isPaused]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animate]);

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
              <div
                key={i}
                className="shrink-0 w-64 sm:w-72 md:w-80 border border-border p-5 sm:p-6 lg:p-8 flex flex-col items-center text-center"
              >
                <div className="flex gap-0.5 mb-3 sm:mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${si < t.rating ? "fill-foreground text-foreground" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground mb-4 sm:mb-6">
                  {t.text}
                </p>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted mb-2 sm:mb-3 overflow-hidden">
                  <div className="w-full h-full bg-muted-foreground/20 rounded-full" />
                </div>
                <p className="text-sm font-semibold italic text-foreground">
                  {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
