"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Eye } from "lucide-react";
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

  const currentImage = activeColor?.imageUrl ?? item.mediaUrl;
  const hasHoverImage = !!item.hoverMediaUrl && !isVideo(item.hoverMediaUrl);
  const showHover = isHovered && hasHoverImage;

  function handleColorClick(e: React.MouseEvent, color: NonNullable<CollectionProduct["colors"]>[number]) {
    e.preventDefault();
    e.stopPropagation();
    setActiveColor((prev) => (prev?.name === color.name ? null : color));
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
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showHover ? "opacity-0" : "opacity-100"}`}
            />
            {hasHoverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.hoverMediaUrl!}
                alt={item.name}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showHover ? "opacity-100" : "opacity-0"}`}
              />
            )}
          </>
        )
      ) : (
        <div className="absolute inset-0 bg-[#FAFAFA] flex items-center justify-center">
          <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">Sin imagen</span>
        </div>
      )}

      {/* Ver detalle overlay */}
      <div
        className={`absolute inset-0 bg-[#154734]/10 transition-opacity duration-500 z-10 flex items-center justify-center ${isHovered ? "opacity-100" : "opacity-0"}`}
      >
        <div className={`bg-white/90 text-[#154734] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all duration-500 ${isHovered ? "translate-y-0" : "translate-y-4"}`}>
          <Eye className="w-4 h-4" />
          Ver detalle
        </div>
      </div>

      {item.badge && (
        <span
          className={`absolute top-4 right-4 z-20 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-md ${
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
      <div className={`flex flex-col gap-1 ${center ? "items-center sm:items-start" : "items-start"}`}>
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
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
                  : "border-gray-200 hover:scale-110"
              }`}
              style={{ backgroundColor: color.hexCode }}
            />
          ))}
        </div>
      </div>
    ) : null;

  if (viewMode === "list") {
    return (
      <Link href={`/product/${item.slug}`} className="cursor-pointer flex gap-5 sm:gap-8">
        <div
          className="relative w-32 sm:w-48 shrink-0 aspect-[3/4] overflow-hidden rounded-none transition-all duration-300 bg-[#FAFAFA] border border-gray-100 shadow-sm"
          style={{ borderRadius: isHovered ? "1rem" : "0" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {imageContent}
        </div>

        <div className="flex flex-col justify-center gap-2 py-2">
          <h3 className={`text-sm sm:text-base font-bold uppercase tracking-widest transition-colors ${isHovered ? "text-[#C19A6B]" : "text-[#154734]"}`}>
            {item.name}
          </h3>
          <div className="flex items-center gap-3">
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
    <Link href={`/product/${item.slug}`} className="cursor-pointer block">
      <div
        className="relative aspect-[3/4] mb-5 overflow-hidden transition-all duration-300 bg-[#FAFAFA] border border-gray-100 shadow-sm"
        style={{ borderRadius: isHovered ? "1rem" : "0" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {imageContent}
      </div>

      <div className="px-1 text-center sm:text-left flex flex-col items-center sm:items-start gap-2">
        <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors truncate w-full ${isHovered ? "text-[#C19A6B]" : "text-[#154734]"}`}>
          {item.name}
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-sm">
          <span className="font-medium text-[#154734]">${item.price.toLocaleString("es-CO")}</span>
          {item.oldPrice && (
            <span className="text-gray-400 line-through text-xs font-light">${item.oldPrice.toLocaleString("es-CO")}</span>
          )}
        </div>
        {colorSwatches(true)}
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
      <div className="flex flex-col gap-6">
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
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 sm:gap-y-16">
      {products.map((item, index) => (
        <div
          key={item.slug}
          className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <ProductCard item={item} viewMode="grid" />
        </div>
      ))}
    </div>
  );
}
