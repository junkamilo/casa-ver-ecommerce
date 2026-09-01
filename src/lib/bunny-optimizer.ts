/**
 * Bunny CDN Optimizer query params for hero delivery.
 * Requires Optimizer enabled on the pull zone (ops checklist).
 */

import { isBunnyCdnUrl } from "@/lib/media-url";

export type HeroOptimizerOptions = {
  width: number;
  quality?: number;
  format?: "auto" | "webp" | "avif";
};

export function heroOptimizedUrl(
  url: string,
  options: HeroOptimizerOptions,
): string {
  if (!isBunnyCdnUrl(url)) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("width", String(options.width));
    parsed.searchParams.set("format", options.format ?? "auto");
    parsed.searchParams.set("quality", String(options.quality ?? 80));
    return parsed.toString();
  } catch {
    return url;
  }
}

export const HERO_OPTIMIZER_WIDTHS = {
  desktop: 2560,
  tablet: 1536,
  mobile: 1080,
} as const;
