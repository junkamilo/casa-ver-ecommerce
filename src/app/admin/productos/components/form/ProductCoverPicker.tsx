"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import type { SelectedColor } from "../../types";
import { isVideoUrl } from "@/modules/catalog/product/domain/video-url.entity";

type CoverCandidate = {
  url: string;
  colorName: string;
  hexCode: string;
};

function collectCandidates(colors: SelectedColor[]): CoverCandidate[] {
  const seen = new Set<string>();
  const out: CoverCandidate[] = [];
  for (const color of colors) {
    for (const url of color.images) {
      const trimmed = url?.trim();
      if (!trimmed || seen.has(trimmed)) continue;
      seen.add(trimmed);
      out.push({ url: trimmed, colorName: color.name, hexCode: color.hexCode });
    }
  }
  return out;
}

interface ProductCoverPickerProps {
  title: string;
  helpText: string;
  colors: SelectedColor[];
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  error?: string | null;
}

export default function ProductCoverPicker({
  title,
  helpText,
  colors,
  value,
  onChange,
  disabled,
  error,
}: ProductCoverPickerProps) {
  const candidates = collectCandidates(colors);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(maxScroll > 4 && el.scrollLeft < maxScroll - 4);
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
  }, [candidates.length, updateScrollState]);

  function scrollByDir(dir: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(140, Math.round(el.clientWidth * 0.7));
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  }

  return (
    <div
      className={`bg-gray-50 rounded-xl border p-4 space-y-3 transition-colors ${
        error ? "border-red-400 bg-red-50/30" : "border-gray-200"
      }`}
    >
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {title} <span className="text-red-500">*</span>
        </p>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{helpText}</p>
      </div>

      {candidates.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-2">
          Sube al menos una foto o video en algún color para elegir la portada.
        </p>
      ) : (
        <div className="relative w-full min-w-0">
          {canScrollLeft && (
            <>
              <div
                className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-10 bg-linear-to-r from-gray-50 via-gray-50/90 to-transparent"
                aria-hidden
              />
              <button
                type="button"
                aria-label="Ver imágenes anteriores"
                onClick={() => scrollByDir("left")}
                className="absolute left-1 top-1/2 z-20 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm text-[#154734] hover:bg-gray-50 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </>
          )}

          {canScrollRight && (
            <>
              <div
                className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-10 bg-linear-to-l from-gray-50 via-gray-50/90 to-transparent"
                aria-hidden
              />
              <button
                type="button"
                aria-label="Ver más imágenes"
                onClick={() => scrollByDir("right")}
                className="absolute right-1 top-1/2 z-20 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm text-[#154734] hover:bg-gray-50 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </>
          )}

          <div
            ref={scrollerRef}
            className="flex flex-nowrap gap-3 overflow-x-auto scrollbar-hide overscroll-x-contain touch-pan-x pb-1"
          >
            {candidates.map((item) => {
              const selected = value === item.url;
              const video = isVideoUrl(item.url);
              return (
                <button
                  key={item.url}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(item.url)}
                  className={`relative group shrink-0 w-[132px] sm:w-[148px] rounded-xl overflow-hidden border-2 text-left transition-all disabled:opacity-50 ${
                    selected
                      ? "border-[#154734] ring-2 ring-[#154734]/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="relative aspect-[4/5] bg-gray-100">
                    {video ? (
                      <video
                        src={item.url}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <Image
                        src={item.url}
                        alt={item.colorName}
                        fill
                        className="object-cover"
                        sizes="148px"
                      />
                    )}
                    {selected && (
                      <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-md bg-[#154734] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow">
                        <Check className="w-3 h-3" />
                        Portada
                      </span>
                    )}
                  </div>
                  <div className="px-2 py-1.5 bg-white flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: item.hexCode }}
                    />
                    <span className="text-[11px] font-medium text-gray-600 truncate">
                      {item.colorName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error ? <p className="text-red-500 text-xs font-medium">{error}</p> : null}
    </div>
  );
}
