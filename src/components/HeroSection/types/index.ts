import type { StaticImageData } from "next/image";

export interface Slide {
  id: string;
  image: string | StaticImageData;
  mediaType?: "image" | "video";
  headline?: string;
  subheadline?: string;
}

export type HeroButtonVariant = "primary" | "secondary";

export interface HeroButton {
  label: string;
  href: string;
  variant: HeroButtonVariant;
}

export interface SlideTrackProps {
  currentSlide: number;
  slides: Slide[];
}

export interface UseHeroSectionReturn {
  currentSlide: number;
}
