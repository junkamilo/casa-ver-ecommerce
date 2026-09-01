import type { StaticImageData } from "next/image";
import type { HeroPreviewLayout } from "./types";

export type HeroArtUrls = {
  desktop: string | StaticImageData;
  mobile?: string | null;
  tablet?: string | null;
};

/** Resolve art-direction URL for a device; falls back to desktop. */
export function resolveHeroMediaUrl(
  urls: HeroArtUrls,
  device: HeroPreviewLayout = "desktop",
): string | StaticImageData {
  if (device === "mobile") {
    return urls.mobile || urls.desktop;
  }
  if (device === "tablet") {
    return urls.tablet || urls.desktop;
  }
  return urls.desktop;
}

export function isCdnHeroUrl(src: string | StaticImageData): src is string {
  return typeof src === "string";
}

/** Expected aspect ratios for designer specs (width/height). */
export const HERO_EXPECTED_RATIOS = {
  desktop: 2560 / 1100, // ~21:9
  tablet: 1536 / 1024, // 3:2
  mobile: 1080 / 1350, // 4:5
} as const;

const RATIO_TOLERANCE = 0.12;

export function isHeroRatioClose(
  width: number,
  height: number,
  device: HeroPreviewLayout,
): boolean {
  if (!width || !height) return true;
  const actual = width / height;
  const expected = HERO_EXPECTED_RATIOS[device];
  return Math.abs(actual - expected) / expected <= RATIO_TOLERANCE;
}
