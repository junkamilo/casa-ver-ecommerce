"use client";

import Image from "next/image";
import Link from "next/link";

import { useHeroSection } from "./useHeroSection";
import {
  SLIDES,
  HERO_BUTTONS,
  BRAND_GREEN,
  BRAND_GOLD,
  GRADIENT_DIAGONAL,
  GRADIENT_BOTTOM,
  SHIMMER_PRIMARY,
  SHIMMER_SECONDARY,
} from "./HeroSection.constants";
import type { HeroButton } from "./HeroSection.types";

// ─── Sub-componentes privados ────────────────────────────────────────────────

function SlideTrack({ currentSlide }: { currentSlide: number }) {
  return (
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
            className="object-cover object-center md:object-top"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}

function Overlays() {
  return (
    <>
      <div className="absolute inset-0 z-10"         style={{ background: GRADIENT_DIAGONAL }} aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-2/3 z-10" style={{ background: GRADIENT_BOTTOM }}   aria-hidden="true" />
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
    </>
  );
}

function CtaButton({ label, href, variant }: HeroButton) {
  const isPrimary = variant === "primary";

  return (
    <Link
      href={href}
      className={[
        "group relative overflow-hidden flex items-center justify-center",
        "px-4 sm:px-6 py-3 h-10 sm:h-11",
        "text-[10px] sm:text-[11px] font-black tracking-[0.32em] uppercase",
        "transition-all duration-400 active:scale-95 flex-1 sm:flex-none",
        "focus-visible:outline",
        isPrimary
          ? "text-white hover:shadow-[0_0_28px_rgba(193,154,107,0.28)] focus-visible:outline-[#C19A6B]"
          : "text-black hover:shadow-[0_0_28px_rgba(193,154,107,0.28)] focus-visible:outline-[#154734]",
      ].join(" ")}
      style={isPrimary ? { background: BRAND_GREEN } : { background: BRAND_GOLD }}
    >
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
        style={{ background: isPrimary ? SHIMMER_PRIMARY : SHIMMER_SECONDARY }}
      />
      <span
        className={[
          "absolute inset-0 border border-transparent transition-colors duration-400",
          isPrimary ? "group-hover:border-[#C19A6B]/45" : "group-hover:border-black/20",
        ].join(" ")}
      />
      <span className="relative">{label}</span>
    </Link>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

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
