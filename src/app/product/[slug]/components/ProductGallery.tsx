"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Maximize2, X } from "lucide-react";

import { useProductGallery } from "../hooks/useProductGallery";
import { normalizeVideoUrl } from "../utils";

interface Props {
  gallery: string[];
  videoUrl?: string | null;
  selectedImage: number;
  productName: string;
  onSelect: (index: number) => void;
  activeColorHex?: string;
}

export default function ProductGallery({
  gallery,
  videoUrl,
  selectedImage,
  productName,
  onSelect,
  activeColorHex,
}: Props) {
  const {
    media,
    currentIndex,
    isZoomOpen,
    setIsZoomOpen,
    goTo,
    handleThumbnail,
    handleTouchStart,
    handleTouchEnd,
  } = useProductGallery(gallery, videoUrl, selectedImage, onSelect);

  if (!media.length) return null;

  const currentMedia = media[currentIndex];
  const isCurrentVideo = !!(videoUrl && currentMedia === videoUrl);

  return (
    <>
      <div className="flex flex-col-reverse lg:flex-row gap-3 sm:gap-4 lg:gap-5">

        {/* Miniaturas */}
        <div className="flex lg:flex-col gap-2 sm:gap-3 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden py-2 lg:py-0 scrollbar-hide lg:w-20 xl:w-24 shrink-0 lg:max-h-175 xl:max-h-200 snap-x snap-mandatory lg:snap-none">
          {media.map((url, i) => {
            const isSelected = currentIndex === i;
            const isVideo = !!(videoUrl && url === videoUrl);
            return (
              <button
                key={i}
                onClick={() => handleThumbnail(i)}
                aria-label={isVideo ? `Ver video de ${productName}` : `Ver imagen ${i + 1} de ${productName}`}
                className={`relative w-14 h-16 sm:w-20 sm:h-28 lg:w-full lg:h-28 xl:h-32 shrink-0 snap-center lg:snap-none rounded-lg sm:rounded-xl overflow-hidden transition-all duration-500 ease-out focus:outline-none touch-target active:scale-90 ${
                  isSelected
                    ? "ring-2 ring-[#C19A6B] ring-offset-2 opacity-100 shadow-sm"
                    : "opacity-55 grayscale-30 hover:opacity-100 hover:grayscale-0 hover:shadow-md hover:ring-1 hover:ring-[#C19A6B]/40 hover:ring-offset-1"
                }`}
              >
                {isVideo ? (
                  <>
                    <video
                      src={normalizeVideoUrl(url)}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                        <Play className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#154734] fill-[#154734] ml-0.5" />
                      </div>
                    </div>
                  </>
                ) : (
                  <Image
                    src={url}
                    alt={`Miniatura ${i + 1} de ${productName}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 56px, (max-width: 768px) 80px, 120px"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Imagen principal */}
        <div
          className={`relative w-full aspect-4/5 sm:aspect-3/4 bg-[#FAFAFA] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100 group touch-target ${
            isCurrentVideo ? "cursor-default" : "cursor-zoom-in"
          }`}
          style={{
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => { if (!isCurrentVideo) setIsZoomOpen(true); }}
        >

          {/* Tira de medios — deslizamiento con CSS */}
          <div
            className="absolute inset-0 flex"
            style={{
              width: `${media.length * 100}%`,
              transform: `translateX(-${(currentIndex * 100) / media.length}%)`,
              transition: "transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {media.map((url, i) => {
              const isItemVideo = !!(videoUrl && url === videoUrl);
              const isCurrent = i === currentIndex;
              return (
                <div
                  key={url}
                  className="relative h-full shrink-0 overflow-hidden"
                  style={{ width: `${100 / media.length}%` }}
                >
                  {isItemVideo ? (
                    <video
                      src={normalizeVideoUrl(url)}
                      autoPlay={isCurrent}
                      loop
                      muted
                      playsInline
                      controls
                      preload={isCurrent ? "auto" : "metadata"}
                      className="absolute inset-0 w-full h-full object-cover z-10"
                    />
                  ) : (
                    <Image
                      src={url}
                      alt={isCurrent ? productName : `${productName} — imagen ${i + 1}`}
                      fill
                      priority={i === 0}
                      className={`object-cover transition-transform duration-700 ease-out z-10 ${
                        isCurrent ? "group-hover:scale-[1.03]" : ""
                      }`}
                      sizes="(max-width: 768px) 100vw, 60vw"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {media.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(currentIndex - 1); }}
                aria-label="Medio anterior"
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-9 h-10 sm:h-9 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-md transition-all duration-200 hover:bg-[#154734] hover:border-[#154734] hover:text-white text-gray-700 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 touch-target active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(currentIndex + 1); }}
                aria-label="Siguiente medio"
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-9 h-10 sm:h-9 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-md transition-all duration-200 hover:bg-[#154734] hover:border-[#154734] hover:text-white text-gray-700 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 touch-target active:scale-90"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {!isCurrentVideo && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsZoomOpen(true); }}
              aria-label="Ampliar imagen"
              className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20 w-10 sm:w-9 h-10 sm:h-9 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-md transition-all duration-200 hover:bg-[#154734] hover:border-[#154734] hover:text-white text-gray-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 touch-target active:scale-90"
            >
              <Maximize2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
          )}

          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-20 lg:hidden">
            <span className="bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              {currentIndex + 1} / {media.length}
            </span>
          </div>

          {!isCurrentVideo && (
            <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-black text-white mix-blend-difference drop-shadow-md">
                Casa Verde
              </span>
            </div>
          )}
        </div>
      </div>

      {isZoomOpen && createPortal(
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setIsZoomOpen(false); }}
            aria-label="Cerrar zoom"
            className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10000 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-2.5 sm:p-3 rounded-full transition-all cursor-pointer touch-target active:scale-90"
          >
            <X className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>

          <div
            className="relative w-full h-full max-w-[95vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentMedia}
              alt={productName}
              fill
              className="object-contain"
              sizes="95vw"
              priority
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
