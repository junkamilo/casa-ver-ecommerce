export interface Slide {
  id: string;
  image: string;
}

export type HeroButtonVariant = "primary" | "secondary";

export interface HeroButton {
  label: string;
  href: string;
  variant: HeroButtonVariant;
}

export interface SlideTrackProps {
  currentSlide: number;
}

export interface UseHeroSectionReturn {
  currentSlide: number;
}
