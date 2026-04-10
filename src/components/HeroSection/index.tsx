"use client";

import { useHeroSection } from "./hooks";
import { HERO_BUTTONS } from "./constants";
import { SlideTrack, Overlays, CtaButton } from "./components";

export default function HeroSection() {
  const { currentSlide } = useHeroSection();

  return (
    <section className="relative w-full h-80 sm:h-screen md:h-[72vh] sm:min-h-120 md:min-h-125 md:max-h-190 lg:min-h-130 lg:max-h-200 xl:max-h-205 2xl:max-h-215 overflow-hidden select-none bg-black">

      <SlideTrack currentSlide={currentSlide} />
      <Overlays />

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
