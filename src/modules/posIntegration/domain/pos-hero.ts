import { normalizeMediaFocus } from "@/components/HeroSection/mediaFocus";
import type { Slide } from "@/components/HeroSection/types";
import type { PosHeroSlide } from "../contracts/pos-banners.schema";

/** Banners del POS → slides del carrusel del inicio (en orden y solo con archivo). */
export function mapPosHeroSlides(slides: PosHeroSlide[]): Slide[] {
  return [...slides]
    .filter((s) => Boolean(s.mediaUrl?.trim()))
    .sort((a, b) => a.position - b.position)
    .map((s) => ({
      id: s.id,
      image: s.mediaUrl,
      imageMobile: s.mediaUrlMobile ?? null,
      imageTablet: s.mediaUrlTablet ?? null,
      posterUrl: s.posterUrl ?? null,
      mediaType: s.mediaType,
      headline: s.headline ?? undefined,
      subheadline: s.subheadline ?? undefined,
      mediaFocus: normalizeMediaFocus(s.mediaFocus),
      playFullVideo: s.mediaType === "video" && s.playFullVideo,
      href: s.linkUrl ?? undefined,
    }));
}
