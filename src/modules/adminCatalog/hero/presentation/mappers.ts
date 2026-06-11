import type { HeroSlideDTO } from "../contracts/hero.dto";

export type HeroSlideUiModel = {
  id: string;
  position: number;
  mediaUrl: string;
  mediaType: "image" | "video";
  headline: string | null;
  subheadline: string | null;
  isActive: boolean;
  updatedAt: string;
};

export function mapHeroSlideDtoToUi(slide: HeroSlideDTO): HeroSlideUiModel {
  return {
    id: slide.id,
    position: slide.position,
    mediaUrl: slide.mediaUrl,
    mediaType: slide.mediaType as "image" | "video",
    headline: slide.headline,
    subheadline: slide.subheadline,
    isActive: slide.isActive,
    updatedAt: slide.updatedAt instanceof Date ? slide.updatedAt.toISOString() : String(slide.updatedAt ?? ""),
  };
}

export function mapHeroSlideDtoListToUi(slides: HeroSlideDTO[]): HeroSlideUiModel[] {
  return slides.map(mapHeroSlideDtoToUi);
}
