"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import type { CollectionProduct } from "../types";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".ogg"];

function isVideo(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

interface ProductGridProps {
  products: CollectionProduct[];
  viewMode: "grid" | "list";
}

type ActiveColor = { name: string; hexCode: string; imageUrl?: string | null } | null;

function ProductCard({ item, viewMode }: { item: CollectionProduct; viewMode: "grid" | "list" }) {
  const [activeColor, setActiveColor] = useState<ActiveColor>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = item.images;
  const hasImages = images.length > 0;

  // Active image: color override takes priority
  const currentImage = activeColor?.imageUrl ?? (hasImages ? images[currentIndex] : null);

  // Hover swap: only when on first slide, no color selected, and a second image exists
  const canHoverSwap = !activeColor && currentIndex === 0 && images.length > 1 && !isVideo(images[0]);
  const showHover = isHovered && canHoverSwap;

  // Arrows: only visible when no color selected, more than 1 general image
  const showArrows = !activeColor && images.length > 1;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < images.length - 1;

  function prevImage() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function nextImage() {
    setCurrentIndex((i) => Math.min(images.length - 1, i + 1));
  }

  function handleColorClick(e: React.MouseEvent, color: NonNullable<CollectionProduct["colors"]>[number]) {
    e.preventDefault();
    e.stopPropagation();
    setActiveColor((prev) => (prev?.name === color.name ? null : color));
    setCurrentIndex(0);
  }

  const imageContent = (
    <>
      {currentImage ? (
        isVideo(currentImage) ? (
          <>
            <video
              src={currentImage}
              muted loop playsInline autoPlay
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white/30 backdrop-blur-md pointer-events-none">
              <Play className="w-3 h-3 text-white ml-0.5" fill="currentColor" />
            </div>
          </>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt={item.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${showHover ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
            />
            {canHoverSwap && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[1]}
                alt={item.name}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${showHover ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
              />
            )}
          </>
        )
      ) : (
        <div className="absolute inset-0 bg-[#FAFAFA] flex items-center justify-center">
          <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">Sin imagen</span>
        </div>
      )}

      {/* Flechas del Carrusel (Diseño Innovado sin "Ver detalle") */}
      {showArrows && (
        <>
          {canGoPrev && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevImage(); }}
              className={`absolute left-3 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-[#C19A6B]/20 shadow-[0_5px_15px_-3px_rgba(21,71,52,0.15)] transition-all duration-500 hover:scale-110 hover:bg-[#154734] hover:border-[#154734] text-[#154734] hover:text-[#C19A6B] ${
                isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-5 h-5 pr-0.5" />
            </button>
          )}
          {canGoNext && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextImage(); }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-[#C19A6B]/20 shadow-[0_5px_15px_-3px_rgba(21,71,52,0.15)] transition-all duration-500 hover:scale-110 hover:bg-[#154734] hover:border-[#154734] text-[#154734] hover:text-[#C19A6B] ${
                isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
              }`}
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-5 h-5 pl-0.5" />
            </button>
          )}

          {/* Indicadores de puntos (Dots) */}
          <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(i); }}
                className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${i === currentIndex ? "bg-[#C19A6B] w-4" : "bg-white/80 w-1.5 hover:bg-white"}`}
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Badges (Etiquetas) */}
      {item.badge && (
        <span
          className={`absolute top-3 right-3 z-20 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-md ${
            item.badge === "Oferta" ? "bg-[#C19A6B]" : item.badge === "Nuevo" ? "bg-[#154734]" : "bg-gray-900"
          }`}
        >
          {item.badge}
        </span>
      )}
    </>
  );

  const colorSwatches = (center = false) =>
    item.colors && item.colors.length > 0 ? (
      <div className={`flex flex-col gap-1.5 ${center ? "items-center sm:items-start" : "items-start"}`}>
        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
          Color{activeColor ? <span className="text-[#154734] ml-1">{activeColor.name}</span> : null}
        </span>
        <div className="flex gap-1.5 items-center flex-wrap">
          {item.colors.map((color) => (
            <button
              key={color.name}
              title={color.name}
              onClick={(e) => handleColorClick(e, color)}
              className={`w-4 h-4 rounded-full border shadow-sm transition-all duration-200 shrink-0 ${
                activeColor?.name === color.name
                  ? "ring-2 ring-offset-1 ring-[#154734] scale-110 border-[#154734]"
                  : "border-gray-200 hover:scale-110 hover:border-gray-400"
              }`}
              style={{ backgroundColor: color.hexCode }}
            />
          ))}
        </div>
      </div>
    ) : null;

  if (viewMode === "list") {
    return (
      <Link 
        href={`/product/${item.slug}`} 
        className="cursor-pointer flex gap-4 sm:gap-6 bg-white p-3 sm:p-4 rounded-[1.5rem] border border-[#C19A6B]/20 hover:border-[#C19A6B]/60 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(193,154,107,0.15)] transition-all duration-500 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-32 sm:w-48 shrink-0 aspect-[3/4] overflow-hidden rounded-xl bg-[#FAFAFA] border border-gray-50">
          {imageContent}
        </div>

        <div className="flex flex-col justify-center gap-2 py-2 flex-1">
          <h3 className={`text-sm sm:text-base font-bold uppercase tracking-widest transition-colors ${isHovered ? "text-[#C19A6B]" : "text-[#154734]"}`}>
            {item.name}
          </h3>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-medium text-[#154734] text-sm">${item.price.toLocaleString("es-CO")}</span>
            {item.oldPrice && (
              <span className="text-gray-400 line-through text-xs font-light">${item.oldPrice.toLocaleString("es-CO")}</span>
            )}
          </div>
          {colorSwatches(false)}
        </div>
      </Link>
    );
  }

  return (
    <Link 
      href={`/product/${item.slug}`} 
      className="cursor-pointer flex flex-col h-full bg-white p-3 sm:p-4 rounded-[1.5rem] border border-[#C19A6B]/20 hover:border-[#C19A6B]/60 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(193,154,107,0.15)] transition-all duration-500 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-xl bg-[#FAFAFA] border border-gray-50">
        {imageContent}
      </div>

      <div className="px-1 text-center sm:text-left flex flex-col flex-1 items-center sm:items-start gap-2">
        <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors w-full truncate ${isHovered ? "text-[#C19A6B]" : "text-[#154734]"}`}>
          {item.name}
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-sm mb-1">
          <span className="font-medium text-[#154734]">${item.price.toLocaleString("es-CO")}</span>
          {item.oldPrice && (
            <span className="text-gray-400 line-through text-xs font-light">${item.oldPrice.toLocaleString("es-CO")}</span>
          )}
        </div>
        <div className="mt-auto pt-1 w-full flex justify-center sm:justify-start">
          {colorSwatches(true)}
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ products, viewMode }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center bg-[#FAFAFA] rounded-3xl border border-dashed border-gray-200">
        <span className="text-4xl mb-4">✨</span>
        <h3 className="text-lg font-bold text-[#154734] mb-2 uppercase tracking-widest">Colección en camino</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Pronto añadiremos nuevas prendas exclusivas a esta colección. ¡Vuelve a visitarnos!
        </p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-5">
        {products.map((item, index) => (
          <div
            key={item.slug}
            className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <ProductCard item={item} viewMode="list" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8 sm:gap-y-10">
      {products.map((item, index) => (
        <div
          key={item.slug}
          className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both h-full"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <ProductCard item={item} viewMode="grid" />
        </div>
      ))}
    </div>
  );
}