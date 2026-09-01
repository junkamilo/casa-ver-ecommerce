import { normalizeMediaFocus, type MediaFocus } from "@/components/HeroSection/mediaFocus";

export type HeroSlideUiModel = {
  id: string;
  position: number;
  mediaUrl: string;
  mediaUrlMobile: string | null;
  mediaUrlTablet: string | null;
  posterUrl: string | null;
  mediaType: "image" | "video";
  headline: string | null;
  subheadline: string | null;
  mediaFocus: MediaFocus;
  playFullVideo: boolean;
  isActive: boolean;
  updatedAt: string;
};

export type HeroSettingsUiModel = {
  slideDurationMs: number;
  updatedAt: string;
};

export function mapHeroSlideDtoToUi(slide: {
  id: string;
  position: number;
  mediaUrl: string;
  mediaUrlMobile?: string | null;
  mediaUrlTablet?: string | null;
  posterUrl?: string | null;
  mediaType: string;
  headline: string | null;
  subheadline: string | null;
  mediaFocus?: unknown;
  playFullVideo?: boolean;
  isActive: boolean;
  updatedAt: Date | string;
}): HeroSlideUiModel {
  return {
    id: slide.id,
    position: slide.position,
    mediaUrl: slide.mediaUrl,
    mediaUrlMobile: slide.mediaUrlMobile ?? null,
    mediaUrlTablet: slide.mediaUrlTablet ?? null,
    posterUrl: slide.posterUrl ?? null,
    mediaType: slide.mediaType as "image" | "video",
    headline: slide.headline,
    subheadline: slide.subheadline,
    mediaFocus: normalizeMediaFocus(slide.mediaFocus),
    playFullVideo: Boolean(slide.playFullVideo),
    isActive: slide.isActive,
    updatedAt:
      slide.updatedAt instanceof Date
        ? slide.updatedAt.toISOString()
        : String(slide.updatedAt ?? ""),
  };
}

export function mapHeroSlideDtoListToUi(
  slides: Parameters<typeof mapHeroSlideDtoToUi>[0][],
): HeroSlideUiModel[] {
  return slides.map(mapHeroSlideDtoToUi);
}

export function mapHeroSettingsToUi(settings: {
  slideDurationMs: number;
  updatedAt: Date | string;
}): HeroSettingsUiModel {
  return {
    slideDurationMs: settings.slideDurationMs,
    updatedAt:
      settings.updatedAt instanceof Date
        ? settings.updatedAt.toISOString()
        : String(settings.updatedAt ?? ""),
  };
}
