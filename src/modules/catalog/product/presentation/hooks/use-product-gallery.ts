"use client";

import { useState, useEffect, useRef } from "react";
import { isVideoUrl } from "../../domain/video-url.entity";

/**
 * Hook UI para la galería de medios del PDP. Maneja:
 *   - Navegación circular (`goTo`) con wrap-around.
 *   - Soporte de gestos táctiles (swipe horizontal con umbral 50px).
 *   - Apertura del lightbox/zoom (solo imágenes, no videos).
 *   - Sync bidireccional con el `selectedImage` controlado por el padre.
 */
export function useProductGallery(
  gallery: string[],
  selectedImage: number,
  onSelect: (index: number) => void,
) {
  const media = gallery;
  const [currentIndex, setCurrentIndex] = useState(selectedImage);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    setCurrentIndex(selectedImage);
  }, [selectedImage]);

  useEffect(() => {
    if (isZoomOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isZoomOpen]);

  const goTo = (index: number) => {
    const next = (index + media.length) % media.length;
    setCurrentIndex(next);
    onSelect(next);
  };

  const handleThumbnail = (i: number) => {
    setCurrentIndex(i);
    onSelect(i);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > 50 && absX > absY) {
      goTo(deltaX < 0 ? currentIndex + 1 : currentIndex - 1);
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const currentMedia = media[currentIndex] ?? "";
  const isCurrentVideo = isVideoUrl(currentMedia);

  return {
    media,
    currentIndex,
    currentMedia,
    isCurrentVideo,
    isZoomOpen,
    setIsZoomOpen,
    goTo,
    handleThumbnail,
    handleTouchStart,
    handleTouchEnd,
    isVideoUrl,
  };
}
