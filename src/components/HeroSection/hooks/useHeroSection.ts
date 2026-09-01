"use client";

import { useState, useEffect, useCallback } from "react";
import { AUTOPLAY_TIME } from "../constants";
import type { Slide, UseHeroSectionReturn } from "../types";

function shouldWaitForVideoEnd(slide: Slide | undefined): boolean {
  return slide?.mediaType === "video" && Boolean(slide.playFullVideo);
}

export function useHeroSection(
  slides: Slide[],
  enabled = true,
  slideDurationMs = AUTOPLAY_TIME,
): UseHeroSectionReturn {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideCount = slides.length;
  const activeIndex =
    slideCount === 0 ? 0 : Math.min(currentSlide, slideCount - 1);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => {
      const idx = slideCount > 0 ? Math.min(prev, slideCount - 1) : 0;
      return idx >= slideCount - 1 ? 0 : idx + 1;
    });
  }, [slideCount]);

  const onActiveVideoEnded = useCallback(() => {
    if (!enabled || slideCount <= 1) return;
    goNext();
  }, [enabled, slideCount, goNext]);

  useEffect(() => {
    if (!enabled || slideCount <= 1) return;

    const slide = slides[activeIndex];
    if (shouldWaitForVideoEnd(slide)) {
      return;
    }

    const timer = setTimeout(goNext, slideDurationMs);
    return () => clearTimeout(timer);
  }, [enabled, slideCount, slides, activeIndex, slideDurationMs, goNext]);

  return { currentSlide: activeIndex, onActiveVideoEnded };
}
