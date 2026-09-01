import {
  BRAND_GOLD,
  BRAND_GREEN,
  HERO_BUTTONS,
  EMPTY_HERO_HEADLINE,
  EMPTY_HERO_SUBHEADLINE,
} from "../constants";
import { getHeroLayoutClasses } from "../previewLayoutClasses";
import type { HeroPreviewLayout } from "../types";
import { CtaButton } from "./CtaButton";

type HeroEmptyBannerProps = {
  previewLayout?: HeroPreviewLayout;
};

export function HeroEmptyBanner({ previewLayout }: HeroEmptyBannerProps) {
  const layout = getHeroLayoutClasses(previewLayout);

  return (
    <section
      className={layout.section.replace(/\bbg-black\b/, "")}
      style={{
        background: `linear-gradient(145deg, ${BRAND_GREEN} 0%, #0f3a28 45%, #1a5c40 100%)`,
      }}
    >
      <div
        className="absolute inset-0 z-0 opacity-30"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 80% 60% at 20% 0%, ${BRAND_GOLD}33, transparent 55%)`,
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-px z-10"
        aria-hidden
        style={{
          background: `linear-gradient(90deg, transparent, ${BRAND_GOLD}, transparent)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px z-10 opacity-60"
        aria-hidden
        style={{
          background: `linear-gradient(90deg, transparent, ${BRAND_GOLD}55, transparent)`,
        }}
      />

      <div className={layout.textWrap}>
        <div
          className="text-center opacity-0 animate-hero-in"
          style={{ animationDelay: "150ms", animationFillMode: "forwards" }}
        >
          <h1
            className={layout.headline}
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {EMPTY_HERO_HEADLINE}
          </h1>
        </div>
        <div
          className={layout.subheadlineWrap}
          style={{ animationDelay: "350ms", animationFillMode: "forwards" }}
        >
          <p className={layout.subheadline}>{EMPTY_HERO_SUBHEADLINE}</p>
        </div>
      </div>

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
