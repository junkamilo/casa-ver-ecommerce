"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import type { SlideTrackProps } from "../types";

/**
 * Lazy-carga el video del slide cuando entra al viewport.
 * Evita descargar videos que el usuario quizá nunca vea.
 */
function LazyVideo({ src, isActive }: { src: string; isActive: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && el.src !== src) {
          el.src = src;
          el.load();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  // Pausa/reproduce según si es el slide activo
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isActive) {
      el.play().catch(() => undefined);
    } else {
      el.pause();
    }
  }, [isActive]);

  return (
    <video
      ref={ref}
      className="absolute inset-0 w-full h-full object-cover object-center"
      muted
      playsInline
      loop
      preload="metadata"
      aria-hidden="true"
    />
  );
}

export function SlideTrack({ currentSlide, slides }: SlideTrackProps) {
  return (
    <div
      className="absolute inset-0 flex transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
    >
      {slides.map((slide, index) => {
        const isVideo = slide.mediaType === "video";
        const isActive = index === currentSlide;

        return (
          <div key={slide.id} className="relative w-full h-full shrink-0">
            {isVideo ? (
              <LazyVideo src={slide.image as string} isActive={isActive} />
            ) : (
              <Image
                src={slide.image}
                alt={`Casa Verde — slide ${index + 1}`}
                fill
                // Primer slide: priority (eager). El resto: lazy
                priority={index === 0}
                loading={index === 0 ? undefined : "lazy"}
                className="object-cover object-center md:object-top"
                sizes="100vw"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
