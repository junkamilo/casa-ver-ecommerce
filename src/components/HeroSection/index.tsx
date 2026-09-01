"use client";

import { useHeroSection } from "./hooks";
import { AUTOPLAY_TIME, HERO_BUTTONS } from "./constants";
import { SlideTrack, Overlays, CtaButton, HeroEmptyBanner } from "./components";
import { getHeroLayoutClasses } from "./previewLayoutClasses";
import type { HeroPreviewLayout, Slide } from "./types";

interface HeroSectionProps {
  slides?: Slide[];
  /** Admin device preview: fixed layout classes instead of viewport breakpoints. */
  previewLayout?: HeroPreviewLayout;
  /** When false, carousel autoplay is disabled. Default true. */
  autoplay?: boolean;
  /** Global duration for image slides / videos without playFullVideo. */
  slideDurationMs?: number;
}

export default function HeroSection({
  slides = [],
  previewLayout,
  autoplay = true,
  slideDurationMs = AUTOPLAY_TIME,
}: HeroSectionProps) {
  const { currentSlide, onActiveVideoEnded } = useHeroSection(
    slides,
    autoplay && slides.length > 1,
    slideDurationMs,
  );

  if (slides.length === 0) {
    return <HeroEmptyBanner previewLayout={previewLayout} />;
  }
  const slide = slides[currentSlide];
  const layout = getHeroLayoutClasses(previewLayout);

  return (
    <section className={layout.section}>
      <SlideTrack
        currentSlide={currentSlide}
        slides={slides}
        forceFocusLayout={previewLayout}
        onActiveVideoEnded={onActiveVideoEnded}
      />
      <Overlays />

      {slide?.headline && (
        <div key={`text-${currentSlide}`} className={layout.textWrap}>
          <div
            className="text-center opacity-0 animate-hero-in"
            style={{ animationDelay: "150ms", animationFillMode: "forwards" }}
          >
            <h1
              className={layout.headline}
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {slide.headline}
            </h1>
          </div>
          {slide.subheadline && (
            <div
              className={layout.subheadlineWrap}
              style={{ animationDelay: "350ms", animationFillMode: "forwards" }}
            >
              <p className={layout.subheadline}>{slide.subheadline}</p>
            </div>
          )}
        </div>
      )}

      <div className={layout.ctaOuter}>
        <div className={layout.ctaInner}>
          <div
            className={layout.ctaGap}
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
