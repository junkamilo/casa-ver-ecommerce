import { heroOptimizedUrl, HERO_OPTIMIZER_WIDTHS } from "@/lib/bunny-optimizer";
import { isBunnyCdnUrl } from "@/lib/media-url";
import type { Slide } from "../types";

export function HeroLcpPreload({ slide }: { slide: Slide | null }) {
  if (!slide) return null;

  const isVideo = slide.mediaType === "video";
  const desktopImage = slide.image;
  const mobileRaw = isVideo
    ? slide.posterUrl
    : slide.imageMobile || (typeof slide.image === "string" ? slide.image : null);

  if (!mobileRaw || !isBunnyCdnUrl(mobileRaw)) return null;

  const mobileOpt = heroOptimizedUrl(mobileRaw, {
    width: HERO_OPTIMIZER_WIDTHS.mobile,
    quality: 80,
    format: "auto",
  });

  const links = [
    <link
      key="hero-mobile"
      rel="preload"
      as="image"
      href={mobileOpt}
      media="(max-width: 767px)"
      fetchPriority="high"
    />,
  ];

  if (
    !isVideo &&
    typeof desktopImage === "string" &&
    isBunnyCdnUrl(desktopImage)
  ) {
    links.push(
      <link
        key="hero-desktop"
        rel="preload"
        as="image"
        href={heroOptimizedUrl(desktopImage, {
          width: HERO_OPTIMIZER_WIDTHS.desktop,
          quality: 80,
          format: "auto",
        })}
        media="(min-width: 1024px)"
        fetchPriority="high"
      />,
    );
  }

  return <>{links}</>;
}
