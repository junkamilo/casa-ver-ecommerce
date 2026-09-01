"use client";

import { useRef, useEffect, type CSSProperties } from "react";
import {
  DEFAULT_MEDIA_FOCUS,
  mediaFocusToCssVars,
  normalizeMediaFocus,
} from "../mediaFocus";
import { HeroMedia } from "./HeroMedia";
import type { HeroPreviewLayout, SlideTrackProps } from "../types";

function HeroVideo({
  src,
  poster,
  isActive,
  shouldPreload,
  forceClass,
  playFullVideo,
  onEnded,
}: {
  src: string;
  poster?: string | null;
  isActive: boolean;
  shouldPreload: boolean;
  forceClass?: string;
  playFullVideo?: boolean;
  onEnded?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const wantsMedia = isActive || shouldPreload;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!wantsMedia) {
      el.pause();
      el.removeAttribute("src");
      el.src = "";
      el.load();
      return;
    }

    if (el.getAttribute("src") !== src) {
      el.setAttribute("src", src);
      el.src = src;
      el.load();
    }
  }, [src, wantsMedia]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!isActive) {
      el.pause();
      return;
    }

    let cancelled = false;

    const ensureSrc = () => {
      if (el.getAttribute("src") !== src) {
        el.setAttribute("src", src);
        el.src = src;
        el.load();
      }
    };

    const tryPlay = () => {
      if (cancelled) return;
      if (playFullVideo) {
        try {
          el.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
      void el.play().catch(() => {
        if (!cancelled) {
          window.setTimeout(() => {
            if (!cancelled) void el.play().catch(() => undefined);
          }, 200);
        }
      });
    };

    ensureSrc();

    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
      return () => {
        cancelled = true;
      };
    }

    const onReady = () => tryPlay();
    el.addEventListener("canplay", onReady);
    el.addEventListener("loadeddata", onReady);

    return () => {
      cancelled = true;
      el.removeEventListener("canplay", onReady);
      el.removeEventListener("loadeddata", onReady);
    };
  }, [isActive, src, playFullVideo]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !playFullVideo || !onEnded) return;

    const handleEnded = () => {
      if (isActive) onEnded();
    };
    el.addEventListener("ended", handleEnded);
    return () => el.removeEventListener("ended", handleEnded);
  }, [playFullVideo, onEnded, isActive]);

  return (
    <video
      ref={ref}
      poster={poster ?? undefined}
      className={`hero-slide-media absolute inset-0 w-full h-full${forceClass ? ` ${forceClass}` : ""}`}
      muted
      playsInline
      loop={!playFullVideo}
      preload="none"
      aria-hidden="true"
    />
  );
}

function forceFocusClass(layout?: HeroPreviewLayout): string | undefined {
  if (!layout) return undefined;
  return `hero-slide-media--force-${layout}`;
}

export function SlideTrack({
  currentSlide,
  slides,
  forceFocusLayout,
  onActiveVideoEnded,
}: SlideTrackProps) {
  const forceClass = forceFocusClass(forceFocusLayout);
  const nextIndex = slides.length > 1 ? (currentSlide + 1) % slides.length : -1;
  const prevIndex = slides.length > 1 ? (currentSlide - 1 + slides.length) % slides.length : -1;

  return (
    <div
      className="absolute inset-0 flex transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
    >
      {slides.map((slide, index) => {
        const isVideo = slide.mediaType === "video";
        const isActive = index === currentSlide;
        const shouldPreload = index === nextIndex;
        const mountMedia = isActive || index === nextIndex || index === prevIndex;
        const focus = normalizeMediaFocus(slide.mediaFocus ?? DEFAULT_MEDIA_FOCUS);
        const cssVars = mediaFocusToCssVars(focus) as CSSProperties;

        return (
          <div
            key={slide.id}
            className="relative w-full h-full shrink-0"
            style={cssVars}
          >
            {isVideo ? (
              mountMedia ? (
                <HeroVideo
                  src={slide.image as string}
                  poster={slide.posterUrl}
                  isActive={isActive}
                  shouldPreload={shouldPreload}
                  forceClass={forceClass}
                  playFullVideo={Boolean(slide.playFullVideo)}
                  onEnded={isActive ? onActiveVideoEnded : undefined}
                />
              ) : (
                <div className="absolute inset-0 bg-black" aria-hidden />
              )
            ) : mountMedia ? (
              <HeroMedia
                desktop={slide.image}
                mobile={slide.imageMobile}
                tablet={slide.imageTablet}
                alt={`Casa Verde — slide ${index + 1}`}
                priority={index === 0}
                forceClass={forceClass}
                forceLayout={forceFocusLayout}
              />
            ) : (
              <div className="absolute inset-0 bg-black" aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}
