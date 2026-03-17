"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
const BRAND_GREEN = "#154734";
const BRAND_GOLD = "#C19A6B";

const SLIDES = [
  {
    id: "01",
    image: "/heroImage1.jpg",
  },
  {
    id: "02",
    image: "/heroImage2.jpg",
  }
];

const AUTOPLAY_TIME = 6000;

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, AUTOPLAY_TIME);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-80 sm:h-screen sm:min-h-[480px] md:min-h-[560px] lg:min-h-[680px] xl:max-h-[900px] 2xl:max-h-[1000px] overflow-hidden select-none bg-black">

      <div
        className="absolute inset-0 flex transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {SLIDES.map((slide, index) => (
          <div key={slide.id} className="relative w-full h-full shrink-0">
            <Image
              src={slide.image}
              alt={`Casa Verde — ${slide.id}`}
              fill
              className="object-cover object-center"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(120deg, rgba(10,35,24,0.88) 0%, rgba(21,71,52,0.50) 38%, rgba(21,71,52,0.08) 65%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-2/3 z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(8,28,20,0.75) 0%, rgba(10,35,24,0.35) 40%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute top-0 left-0 right-0 h-px z-20 animate-border-shimmer"
        style={{ background: `linear-gradient(90deg, transparent, ${BRAND_GOLD}, transparent)` }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px z-20"
        style={{ background: `linear-gradient(90deg, transparent, rgba(193,154,107,0.35), transparent)` }}
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex flex-col justify-end z-20 pointer-events-none px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-0">
        <div className="pb-3 sm:pb-16 md:pb-20 lg:pb-24 lg:pb-28 max-w-2xl 2xl:mx-auto 2xl:max-w-4xl">
          <div
            className="flex flex-row items-center gap-2 sm:gap-3 md:gap-4 md:gap-6 opacity-0 animate-hero-in pointer-events-auto"
            style={{ animationDelay: "700ms", animationFillMode: "forwards" }}
          >
            <Link
              href="/tienda"
              className="group relative overflow-hidden px-4 sm:px-6 sm:px-7 py-3 sm:py-3.5 h-10 sm:h-11 text-[10px] sm:text-[11px] font-black tracking-[0.32em] uppercase text-white transition-all duration-400 hover:shadow-[0_0_28px_rgba(193,154,107,0.28)] focus-visible:outline focus-visible:outline-[#C19A6B] active:scale-95 flex-1 sm:flex-none flex items-center justify-center"
              style={{ background: BRAND_GREEN }}
            >
              <span
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                style={{ background: "linear-gradient(90deg, transparent 20%, rgba(193,154,107,0.22) 50%, transparent 80%)" }}
              />
              <span className="absolute inset-0 border border-transparent group-hover:border-[#C19A6B]/45 transition-colors duration-400" />
              <span className="relative">COMPRAR AHORA</span>
            </Link>

            <Link
              href="/collections"
              className="group flex items-center justify-center gap-2.5 px-3 sm:px-4 py-3 h-10 sm:h-11 text-[10px] sm:text-[11px] font-black tracking-[0.32em] uppercase text-black hover:text-black/80 transition-colors duration-300 active:scale-95 flex-1 sm:flex-none bg-[#C19A6B] hover:shadow-[0_0_28px_rgba(193,154,107,0.28)]"
            >
              CATEGORÍAS
              <span className="hidden sm:inline h-px w-5 bg-black/20 group-hover:bg-black/40 transition-all duration-350 ease-out" />
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
