import type { StaticImageData } from "next/image";
import type { MediaFocus } from "../mediaFocus";

/** Forced layout for admin device preview (bypasses viewport media queries). */
export type HeroPreviewLayout = "mobile" | "tablet" | "desktop";

export interface Slide {
  id: string;
  /** Desktop / primary art */
  image: string | StaticImageData;
  /** Art-direction mobile (falls back to image) */
  imageMobile?: string | null;
  /** Art-direction tablet (falls back to image) */
  imageTablet?: string | null;
  /** Optional video poster frame (legacy; not required) */
  /** @deprecated Legacy DB rows only — not set on new saves */
  posterUrl?: string | null;
  mediaType?: "image" | "video";
  headline?: string;
  subheadline?: string;
  mediaFocus?: MediaFocus;
  /** When true and mediaType=video, wait for video end before advancing. */
  playFullVideo?: boolean;
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
  /** Admin preview: force one device's object-position (ignore viewport MQ). */
  forceFocusLayout?: HeroPreviewLayout;
  onActiveVideoEnded?: () => void;
}

export interface UseHeroSectionReturn {
  currentSlide: number;
  onActiveVideoEnded: () => void;
}
