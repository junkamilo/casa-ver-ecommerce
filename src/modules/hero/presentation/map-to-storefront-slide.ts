import { normalizeMediaFocus } from "@/components/HeroSection/mediaFocus";
import type { Slide } from "@/components/HeroSection/types";
import type { HeroSlideUiModel } from "./mappers";

export type DbHeroSlideRow = {
  id: string;
  position: number;
  mediaUrl: string;
  mediaUrlMobile: string | null;
  mediaUrlTablet: string | null;
  posterUrl: string | null;
  mediaType: string;
  headline: string | null;
  subheadline: string | null;
  mediaFocus: unknown;
  playFullVideo: boolean;
};

function mapHeroRowToStorefrontSlide(row: {
  id: string;
  position: number;
  mediaUrl: string;
  mediaUrlMobile?: string | null;
  mediaUrlTablet?: string | null;
  posterUrl?: string | null;
  mediaType: string;
  headline?: string | null;
  subheadline?: string | null;
  mediaFocus?: unknown;
  playFullVideo?: boolean;
}): Slide {
  return {
    id: row.id || `hero-${row.position}`,
    image: row.mediaUrl,
    imageMobile: row.mediaUrlMobile ?? null,
    imageTablet: row.mediaUrlTablet ?? null,
    posterUrl: row.posterUrl ?? null,
    mediaType: (row.mediaType === "video" ? "video" : "image") as "image" | "video",
    headline: row.headline ?? undefined,
    subheadline: row.subheadline ?? undefined,
    mediaFocus: normalizeMediaFocus(row.mediaFocus),
    playFullVideo: Boolean(row.playFullVideo),
  };
}

export function mapDbHeroSlideToStorefrontSlide(row: DbHeroSlideRow): Slide {
  return mapHeroRowToStorefrontSlide(row);
}

export function mapAdminHeroSlideToStorefrontSlide(slide: HeroSlideUiModel): Slide {
  return mapHeroRowToStorefrontSlide({
    id: slide.id,
    position: slide.position,
    mediaUrl: slide.mediaUrl,
    mediaUrlMobile: slide.mediaUrlMobile,
    mediaUrlTablet: slide.mediaUrlTablet,
    posterUrl: slide.posterUrl,
    mediaType: slide.mediaType,
    headline: slide.headline,
    subheadline: slide.subheadline,
    mediaFocus: slide.mediaFocus,
    playFullVideo: slide.playFullVideo,
  });
}

export function filterActiveSlidesWithMedia<T extends { isActive: boolean; mediaUrl: string }>(
  slides: T[],
): T[] {
  return slides.filter((s) => s.isActive && Boolean(s.mediaUrl?.trim()));
}

export function mapActiveDbHeroSlidesToStorefront(slides: DbHeroSlideRow[]): Slide[] {
  return slides
    .filter((s) => Boolean(s.mediaUrl?.trim()))
    .map(mapDbHeroSlideToStorefrontSlide);
}

export function mapActiveAdminHeroSlidesToStorefront(
  slides: HeroSlideUiModel[],
): Slide[] {
  return filterActiveSlidesWithMedia(slides)
    .sort((a, b) => a.position - b.position)
    .map(mapAdminHeroSlideToStorefrontSlide);
}
