"use client";

import { useRef, useState, useEffect } from "react";
import { SCROLL_SPEED } from "../constants/constants";


export function useAutoScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const animate = () => {
      const container = scrollRef.current;
      if (container && !isPausedRef.current) {
        container.scrollLeft += SCROLL_SPEED;

        // When we've scrolled past the first set, reset seamlessly
        const halfScroll = container.scrollWidth / 2;
        if (container.scrollLeft >= halfScroll) {
          container.scrollLeft -= halfScroll;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return { scrollRef, isPaused, setIsPaused };
}
