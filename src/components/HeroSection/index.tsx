"use client";

import { useHeroSection } from "./hooks";
import { HERO_BUTTONS, SLIDES } from "./constants";
import { SlideTrack, Overlays, CtaButton } from "./components";
import type { Slide } from "./types";

interface HeroSectionProps {
  slides?: Slide[];
}

export default function HeroSection({ slides = SLIDES }: HeroSectionProps) {
  const { currentSlide } = useHeroSection(slides.length);
  const slide = slides[currentSlide];

  return (
    <section className="relative w-full h-80 sm:h-screen md:h-[72vh] sm:min-h-120 md:min-h-125 md:max-h-190 lg:min-h-130 lg:max-h-200 xl:max-h-205 2xl:max-h-215 overflow-hidden select-none bg-black">

      <SlideTrack currentSlide={currentSlide} slides={slides} />
      <Overlays />

      {/* Texto del slide — se reanima en cada cambio de slide */}
      {slide.headline && (
        <div
          key={`text-${currentSlide}`}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-4 sm:px-6"
        >
          <div
            className="text-center opacity-0 animate-hero-in"
            style={{ animationDelay: "150ms", animationFillMode: "forwards" }}
          >
            <h1
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {slide.headline}
            </h1>
          </div>
          {slide.subheadline && (
            <div
              className="opacity-0 animate-hero-in mt-3 sm:mt-4 md:mt-5"
              style={{ animationDelay: "350ms", animationFillMode: "forwards" }}
            >
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/85 font-light tracking-widest text-center uppercase">
                {slide.subheadline}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Botones CTA */}
      <div className="absolute inset-0 flex flex-col justify-end z-20 pointer-events-none px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-0">
        <div className="pb-3 sm:pb-16 md:pb-16 lg:pb-20 max-w-2xl 2xl:mx-auto 2xl:max-w-4xl">
          <div
            className="flex flex-row items-center gap-2 sm:gap-3 md:gap-6 opacity-0 animate-hero-in pointer-events-auto"
            style={{ animationDelay: "700ms", animationFillMode: "forwards" }}
          >
            {HERO_BUTTONS.map((btn) => (
              <CtaButton key={btn.href} {...btn} />
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
