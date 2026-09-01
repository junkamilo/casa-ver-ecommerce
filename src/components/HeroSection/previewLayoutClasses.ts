import type { HeroPreviewLayout } from "./types";

type PreviewClassSet = {
  section: string;
  textWrap: string;
  headline: string;
  subheadlineWrap: string;
  subheadline: string;
  ctaOuter: string;
  ctaInner: string;
  ctaGap: string;
};

/** Responsive classes used on the storefront (viewport media queries). */
export const STOREFRONT_HERO_CLASSES: PreviewClassSet = {
  section:
    "relative w-full aspect-[4/5] md:aspect-[3/2] lg:aspect-[21/9] max-h-[720px] overflow-hidden select-none bg-black",
  textWrap:
    "absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-4 sm:px-6",
  headline:
    "text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight",
  subheadlineWrap: "opacity-0 animate-hero-in mt-3 sm:mt-4 md:mt-5",
  subheadline:
    "text-sm sm:text-lg md:text-xl lg:text-2xl text-white/85 font-light tracking-widest text-center uppercase",
  ctaOuter:
    "absolute inset-0 flex flex-col justify-end z-20 pointer-events-none px-4 sm:px-6 md:px-8 lg:px-12",
  ctaInner: "pb-3 sm:pb-16 md:pb-16 lg:pb-20 w-full flex justify-center",
  ctaGap:
    "flex flex-row items-center justify-center gap-2 sm:gap-3 md:gap-6 opacity-0 animate-hero-in pointer-events-auto",
};

/**
 * Fixed aspect ratios for admin preview frames (aligned with storefront).
 * mobile 4/5 · tablet 3/2 · desktop 21/9
 */
export const PREVIEW_LAYOUT_CLASSES: Record<HeroPreviewLayout, PreviewClassSet> = {
  mobile: {
    section:
      "relative w-full aspect-[4/5] overflow-hidden select-none bg-black",
    textWrap:
      "absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-4",
    headline:
      "text-4xl font-bold text-white leading-none tracking-tight",
    subheadlineWrap: "opacity-0 animate-hero-in mt-3",
    subheadline:
      "text-sm text-white/85 font-light tracking-widest text-center uppercase",
    ctaOuter:
      "absolute inset-0 flex flex-col justify-end z-20 pointer-events-none px-4",
    ctaInner: "pb-3 w-full flex justify-center",
    ctaGap:
      "flex flex-row items-center justify-center gap-2 opacity-0 animate-hero-in pointer-events-auto",
  },
  tablet: {
    section:
      "relative w-full aspect-[3/2] overflow-hidden select-none bg-black",
    textWrap:
      "absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-6",
    headline:
      "text-5xl sm:text-6xl font-bold text-white leading-none tracking-tight",
    subheadlineWrap: "opacity-0 animate-hero-in mt-4",
    subheadline:
      "text-lg text-white/85 font-light tracking-widest text-center uppercase",
    ctaOuter:
      "absolute inset-0 flex flex-col justify-end z-20 pointer-events-none px-6",
    ctaInner: "pb-10 w-full flex justify-center",
    ctaGap:
      "flex flex-row items-center justify-center gap-3 opacity-0 animate-hero-in pointer-events-auto",
  },
  desktop: {
    section:
      "relative w-full aspect-[21/9] overflow-hidden select-none bg-black",
    textWrap:
      "absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-6",
    headline:
      "text-6xl lg:text-7xl font-bold text-white leading-none tracking-tight",
    subheadlineWrap: "opacity-0 animate-hero-in mt-5",
    subheadline:
      "text-xl text-white/85 font-light tracking-widest text-center uppercase",
    ctaOuter:
      "absolute inset-0 flex flex-col justify-end z-20 pointer-events-none px-12",
    ctaInner: "pb-12 w-full flex justify-center",
    ctaGap:
      "flex flex-row items-center justify-center gap-6 opacity-0 animate-hero-in pointer-events-auto",
  },
};

export function getHeroLayoutClasses(previewLayout?: HeroPreviewLayout): PreviewClassSet {
  if (!previewLayout) return STOREFRONT_HERO_CLASSES;
  return PREVIEW_LAYOUT_CLASSES[previewLayout];
}

/** Frame widths + aspect for focus editor / preview chrome. */
export const PREVIEW_DEVICE_FRAMES: Record<
  HeroPreviewLayout,
  { width: number; aspectClass: string }
> = {
  mobile: { width: 390, aspectClass: "aspect-[4/5]" },
  tablet: { width: 768, aspectClass: "aspect-[3/2]" },
  desktop: { width: 1200, aspectClass: "aspect-[21/9]" },
};
