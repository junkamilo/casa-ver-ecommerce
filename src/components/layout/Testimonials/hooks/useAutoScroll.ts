"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { SCROLL_SPEED } from "../constants/constants";


export function useAutoScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>(0);

  const animate = useCallback(() => {
    const container = scrollRef.current;
    if (!container || isPaused) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    container.scrollLeft += SCROLL_SPEED;

    // When we've scrolled past the first set, reset seamlessly
    const halfScroll = container.scrollWidth / 2;
    if (container.scrollLeft >= halfScroll) {
      container.scrollLeft -= halfScroll;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isPaused]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animate]);

  return { scrollRef, isPaused, setIsPaused };
}
