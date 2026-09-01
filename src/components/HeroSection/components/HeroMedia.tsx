"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import { isCdnHeroUrl, resolveHeroMediaUrl } from "../resolveHeroMedia";
import { heroOptimizedUrl, HERO_OPTIMIZER_WIDTHS } from "@/lib/bunny-optimizer";
import type { HeroPreviewLayout } from "../types";

type HeroMediaProps = {
  desktop: string | StaticImageData;
  mobile?: string | null;
  tablet?: string | null;
  alt: string;
  priority?: boolean;
  forceClass?: string;
  forceLayout?: HeroPreviewLayout;
};

export function HeroMedia({
  desktop,
  mobile,
  tablet,
  alt,
  priority = false,
  forceClass,
  forceLayout,
}: HeroMediaProps) {
  const mediaClass = `hero-slide-media absolute inset-0 h-full w-full object-cover${
    forceClass ? ` ${forceClass}` : ""
  }`;

  function optimizedSrc(url: string, device: HeroPreviewLayout): string {
    const width = HERO_OPTIMIZER_WIDTHS[device];
    return heroOptimizedUrl(url, { width, quality: 80, format: "auto" });
  }

  if (forceLayout) {
    const src = resolveHeroMediaUrl({ desktop, mobile, tablet }, forceLayout);
    if (!isCdnHeroUrl(src)) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          fetchPriority={priority ? "high" : "auto"}
          quality={75}
          className={mediaClass}
          sizes="100vw"
        />
      );
    }
    const opt = optimizedSrc(src, forceLayout);
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={opt}
        alt={alt}
        className={mediaClass}
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  if (!isCdnHeroUrl(desktop)) {
    return (
      <Image
        src={desktop}
        alt={alt}
        fill
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        quality={75}
        loading={priority ? undefined : "lazy"}
        className={mediaClass}
        sizes="100vw"
      />
    );
  }

  const desktopUrl = optimizedSrc(desktop, "desktop");
  const tabletUrl = optimizedSrc(tablet || desktop, "tablet");
  const mobileUrl = optimizedSrc(mobile || desktop, "mobile");

  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktopUrl} />
      <source media="(min-width: 768px)" srcSet={tabletUrl} />
      <img
        src={mobileUrl}
        alt={alt}
        className={mediaClass}
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </picture>
  );
}
