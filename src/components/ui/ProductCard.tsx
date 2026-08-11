"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { getProductBadgeClassName } from "@/lib/productBadge";
import {
  isVideoUrl,
  normalizeVideoUrl,
} from "@/modules/catalog/product/domain/video-url.entity";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";

function CardVideo({ src, className }: { src: string; className?: string }) {
  return (
    <video
      key={src}
      src={normalizeVideoUrl(src)}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      className={className}
    />
  );
}

type ActiveColor = { name: string; hexCode: string; imageUrl?: string | null } | null;
type ColorOption = NonNullable<CollectionProduct["colors"]>[number];

/** Fila de colores con scroll X + flechas/fade solo si hay overflow (móvil-friendly). */
function ColorSwatchesRow({
  colors,
  activeColor,
  onColorClick,
}: {
  colors: ColorOption[];
  activeColor: ActiveColor;
  onColorClick: (e: React.MouseEvent, color: ColorOption) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const hasOverflow = maxScroll > 2;
    setCanScrollLeft(hasOverflow && scrollLeft > 2);
    setCanScrollRight(hasOverflow && scrollLeft < maxScroll - 2);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const t = setTimeout(() => updateScrollState(), 0);
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      clearTimeout(t);
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [colors.length, updateScrollState]);

  function scrollByDir(dir: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(72, Math.round(el.clientWidth * 0.55));
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  }

  return (
    <div className="relative w-full min-w-0">
      {canScrollLeft && (
        <>
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-7 bg-linear-to-r from-white via-white/90 to-transparent"
            aria-hidden
          />
          <button
            type="button"
            aria-label="Ver colores anteriores"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollByDir("left");
            }}
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white/95 border border-[#C19A6B]/25 shadow-sm text-[#154734] active:scale-90"
          >
            <ChevronLeft className="w-3 h-3" strokeWidth={2.5} />
          </button>
        </>
      )}

      {canScrollRight && (
        <>
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-7 bg-linear-to-l from-white via-white/90 to-transparent"
            aria-hidden
          />
          <button
            type="button"
            aria-label="Ver más colores"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollByDir("right");
            }}
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white/95 border border-[#C19A6B]/25 shadow-sm text-[#154734] active:scale-90"
          >
            <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
          </button>
        </>
      )}

      <div
        ref={scrollerRef}
        className="flex gap-1.5 md:gap-2 items-center overflow-x-auto scrollbar-hide flex-nowrap w-full p-1.5 overscroll-x-contain touch-pan-x"
      >
        {colors.map((color) => (
          <button
            key={color.name}
            type="button"
            title={color.name}
            onClick={(e) => onColorClick(e, color)}
            className={`w-6 h-6 md:w-7 md:h-7 rounded-full border shadow-sm transition-all duration-200 shrink-0 active:scale-90 ${
              activeColor?.name === color.name
                ? "ring-2 ring-offset-2 ring-[#154734] border-[#154734]"
                : "border-gray-200 hover:scale-110 hover:border-gray-400"
            }`}
            style={{ backgroundColor: color.hexCode }}
          />
        ))}
      </div>
    </div>
  );
}

interface ProductCardProps {
  item: CollectionProduct;
  viewMode?: "grid" | "list";
  setItemKey?: string | null;
  /** Posición en la grilla — las primeras 4 reciben priority=true para LCP */
  index?: number;
}

// Tamaños responsivos para la vista cuadrícula
// grid-cols-2 → ~47vw | sm:grid-cols-3 → ~30vw | xl:grid-cols-4 → ~23vw | 2xl:grid-cols-5 → ~19vw
const GRID_SIZES = "(max-width: 640px) 47vw, (max-width: 1280px) 30vw, (max-width: 1536px) 23vw, 19vw";

// Índices < PRIORITY_THRESHOLD reciben priority=true (preload) para mejorar el LCP
const PRIORITY_THRESHOLD = 4;

const ProductCard = ({ item, viewMode = "grid", index = 99 }: ProductCardProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeColor, setActiveColor] = useState<ActiveColor>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeTipo = searchParams.get("tipo");
  const productHref =
    pathname.startsWith("/collections/") && activeTipo
      ? `/product/${item.slug}?tipo=${encodeURIComponent(activeTipo)}`
      : `/product/${item.slug}`;

  const images = item.images;
  const hasImages = images.length > 0;

  const currentImage = activeColor?.imageUrl ?? (hasImages ? images[currentIndex] : null);

  const canHoverSwap = !activeColor && currentIndex === 0 && images.length > 1 && currentImage && !isVideoUrl(currentImage) && !isVideoUrl(images[1]);
  const showHover = isHovered && canHoverSwap;

  const showArrows = !activeColor && images.length > 1;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < images.length - 1;

  function prevImage() { setCurrentIndex((i) => Math.max(0, i - 1)); }
  function nextImage() { setCurrentIndex((i) => Math.min(images.length - 1, i + 1)); }

  function handleColorClick(e: React.MouseEvent, color: NonNullable<CollectionProduct["colors"]>[number]) {
    e.preventDefault();
    setActiveColor((prev) => (prev?.name === color.name ? null : color));
    setCurrentIndex(0);
  }

  // Siempre alineado a la izquierda; scroll + flechas solo si hay overflow
  const colorSwatches = () =>
    item.colors && item.colors.length > 0 ? (
      <div className="flex flex-col gap-1 w-full min-w-0">
        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
          Color{activeColor ? <span className="text-[#154734] ml-1">{activeColor.name}</span> : null}
        </span>
        <ColorSwatchesRow
          colors={item.colors}
          activeColor={activeColor}
          onColorClick={handleColorClick}
        />
      </div>
    ) : null;

  // ── VISTA LISTA ──────────────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <Link
        href={productHref}
        className="cursor-pointer flex gap-4 sm:gap-6 bg-white p-3 sm:p-4 rounded-3xl border border-[#C19A6B]/20 hover:border-[#C19A6B]/60 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(193,154,107,0.15)] transition-all duration-500 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-28 sm:w-48 shrink-0 aspect-3/4 overflow-hidden rounded-xl bg-[#FAFAFA] border border-gray-50">
          {currentImage ? (
            isVideoUrl(currentImage) ? (
              <>
                <CardVideo
                  src={currentImage}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-white/30 backdrop-blur-md pointer-events-none">
                  <Play className="w-3 h-3 text-white ml-0.5" fill="currentColor" />
                </div>
              </>
            ) : (
              <Image
                src={currentImage}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 112px, 192px"
                priority={index < PRIORITY_THRESHOLD}
                loading={index < PRIORITY_THRESHOLD ? "eager" : "lazy"}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )
          ) : (
            <div className="absolute inset-0 bg-[#FAFAFA] flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">Sin imagen</span>
            </div>
          )}

          {showArrows && (
            <>
              {canGoPrev && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevImage(); }}
                  className={`hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 items-center justify-center w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-[#C19A6B]/20 shadow-md transition-all duration-500 hover:scale-110 hover:bg-[#154734] hover:border-[#154734] text-[#154734] hover:text-[#C19A6B] active:scale-90 ${
                    isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {canGoNext && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextImage(); }}
                  className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 items-center justify-center w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-[#C19A6B]/20 shadow-md transition-all duration-500 hover:scale-110 hover:bg-[#154734] hover:border-[#154734] text-[#154734] hover:text-[#C19A6B] active:scale-90 ${
                    isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                  }`}
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {item.badge && (
            <span className={`absolute top-2 right-2 z-30 ${getProductBadgeClassName(item.badge, { compact: true })}`}>
              {item.badge}
            </span>
          )}
        </div>

        <div className="flex flex-col justify-center gap-2 py-2 flex-1">
          <h3 className={`text-sm sm:text-base font-bold uppercase tracking-widest transition-colors ${isHovered ? "text-[#C19A6B]" : "text-[#154734]"}`}>
            {item.name}
          </h3>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-medium text-[#154734] text-sm">
              {item.isSet && item.minPrice != null
                ? `Desde $${item.minPrice.toLocaleString("es-CO")}`
                : `$${item.price.toLocaleString("es-CO")}`}
            </span>
            {item.oldPrice && (
              <span className="text-gray-400 line-through text-xs font-light">${item.oldPrice.toLocaleString("es-CO")}</span>
            )}
          </div>
          {colorSwatches()}
        </div>
      </Link>
    );
  }

  // ── VISTA CUADRÍCULA ─────────────────────────────────────────────────────
  const isPriority = index < PRIORITY_THRESHOLD;

  return (
    <Link
      href={productHref}
      className="cursor-pointer flex flex-col h-full bg-white p-2 sm:p-3 md:p-4 rounded-3xl border border-[#C19A6B]/20 hover:border-[#C19A6B]/60 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(193,154,107,0.15)] transition-all duration-500 group overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-3/4 mb-3 sm:mb-4 overflow-hidden rounded-xl bg-[#FAFAFA] border border-gray-50">

        {/* ── MÓVIL: carrusel táctil con scroll-snap ── */}
        <div className="md:hidden absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          {activeColor?.imageUrl ? (
            isVideoUrl(activeColor.imageUrl) ? (
              <CardVideo
                src={activeColor.imageUrl}
                className="shrink-0 w-full h-full object-cover snap-center"
              />
            ) : (
              <div className="relative shrink-0 w-full h-full snap-center">
                <Image
                  src={activeColor.imageUrl}
                  alt={item.name}
                  fill
                  sizes={GRID_SIZES}
                  priority={isPriority}
                  loading={isPriority ? "eager" : "lazy"}
                  className="object-cover"
                />
              </div>
            )
          ) : hasImages ? (
            images.map((img, i) =>
              isVideoUrl(img) ? (
                <CardVideo
                  key={img}
                  src={img}
                  className="shrink-0 w-full h-full object-cover snap-center"
                />
              ) : (
                <div key={i} className="relative shrink-0 w-full h-full snap-center">
                  <Image
                    src={img}
                    alt={item.name}
                    fill
                    sizes={GRID_SIZES}
                    // Solo la primera slide es eager; la segunda es lazy
                    priority={isPriority && i === 0}
                    loading={isPriority && i === 0 ? "eager" : "lazy"}
                    className="object-cover"
                  />
                </div>
              )
            )
          ) : (
            <div className="shrink-0 w-full h-full bg-[#FAFAFA] flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">Sin imagen</span>
            </div>
          )}
        </div>

        {/* ── DESKTOP: imagen única + hover swap ── */}
        <div className="hidden md:block absolute inset-0">
          {currentImage ? (
            isVideoUrl(currentImage) ? (
              <>
                <CardVideo
                  src={currentImage}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white/30 backdrop-blur-md pointer-events-none">
                  <Play className="w-3 h-3 text-white ml-0.5" fill="currentColor" />
                </div>
              </>
            ) : (
              <>
                <Image
                  src={currentImage}
                  alt={item.name}
                  fill
                  sizes={GRID_SIZES}
                  priority={isPriority}
                  loading={isPriority ? "eager" : "lazy"}
                  className={`object-cover transition-opacity duration-700 ${showHover ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
                />
                {canHoverSwap && (
                  <Image
                    src={images[1]}
                    alt={item.name}
                    fill
                    sizes={GRID_SIZES}
                    loading="lazy"
                    className={`object-cover transition-all duration-700 ${showHover ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
                  />
                )}
              </>
            )
          ) : (
            <div className="absolute inset-0 bg-[#FAFAFA] flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">Sin imagen</span>
            </div>
          )}
        </div>

        {/* ── Flechas + dots: SOLO desktop ── */}
        {showArrows && (
          <>
            {canGoPrev && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevImage(); }}
                className={`hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-[#C19A6B]/20 shadow-[0_5px_15px_-3px_rgba(21,71,52,0.15)] transition-all duration-500 hover:scale-110 hover:bg-[#154734] hover:border-[#154734] text-[#154734] hover:text-[#C19A6B] active:scale-90 ${
                  isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {canGoNext && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextImage(); }}
                className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-[#C19A6B]/20 shadow-[0_5px_15px_-3px_rgba(21,71,52,0.15)] transition-all duration-500 hover:scale-110 hover:bg-[#154734] hover:border-[#154734] text-[#154734] hover:text-[#C19A6B] active:scale-90 ${
                  isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                }`}
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <div className={`hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 z-30 gap-1.5 transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}>
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

        {item.badge && (
          <span className={`absolute top-3 right-3 z-30 ${getProductBadgeClassName(item.badge)}`}>
            {item.badge}
          </span>
        )}
      </div>

      <div className="px-1 flex flex-col flex-1 items-start gap-1 sm:gap-2 min-w-0">
        <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors w-full truncate leading-tight ${isHovered ? "text-[#C19A6B]" : "text-[#154734]"}`}>
          {item.name}
        </h3>
        <div className="flex flex-row items-center gap-2 sm:gap-3 text-sm mb-0.5 flex-wrap">
          <span className="font-medium text-[#154734] text-sm">
            {item.isSet && item.minPrice != null
              ? `Desde $${item.minPrice.toLocaleString("es-CO")}`
              : `$${item.price.toLocaleString("es-CO")}`}
          </span>
          {item.oldPrice && (
            <span className="text-gray-400 line-through text-xs font-light">${item.oldPrice.toLocaleString("es-CO")}</span>
          )}
        </div>
        <div className="mt-auto pt-0.5 w-full min-w-0">
          {colorSwatches()}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
