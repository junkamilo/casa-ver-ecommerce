"use client";

import { useState, useEffect } from "react";
import { SLIDES, AUTOPLAY_TIME } from "../constants";
import type { UseHeroSectionReturn } from "../types";

export function useHeroSection(): UseHeroSectionReturn {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, AUTOPLAY_TIME);

    return () => clearInterval(timer);
  }, []);

  return { currentSlide };
}
