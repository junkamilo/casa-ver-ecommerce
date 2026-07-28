"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";

interface SuggestedItem {
  name: string;
  slug: string;
  price: number;
  minPrice: number | null;
  image: string | null;
  isSet: boolean;
}

type InterestPopupProps = {
  excludeSlug?: string | null;
};

const DISPLAY_DURATION_MS = 8_000;
const GAP_BETWEEN_MS = 120_000;
/** Primera aparición al entrar a la página (nav SPA o refresh). */
const INITIAL_DELAY_MS = 5_000;
const MAX_SHOWS_PER_SESSION = 4;

function formatPrice(item: SuggestedItem): string {
  if (item.isSet && item.minPrice != null) {
    return `Desde $${item.minPrice.toLocaleString("es-CO")}`;
  }
  return `$${item.price.toLocaleString("es-CO")}`;
}

const InterestPopup = ({ excludeSlug = null }: InterestPopupProps) => {
  const [items, setItems] = useState<SuggestedItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPermanentlyClosed, setIsPermanentlyClosed] = useState(false);
  const showCountRef = useRef(0);
  const itemsRef = useRef<SuggestedItem[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  useEffect(() => {
    let cancelled = false;
    const qs = excludeSlug
      ? `?excludeSlug=${encodeURIComponent(excludeSlug)}`
      : "";

    fetch(`/api/suggested-products${qs}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: SuggestedItem[]) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          itemsRef.current = data;
          setItems(data);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [excludeSlug]);

  useEffect(() => {
    if (isPermanentlyClosed || items.length === 0) return;

    showCountRef.current = 0;
    clearTimers();

    const runCycle = () => {
      if (showCountRef.current >= MAX_SHOWS_PER_SESSION) return;
      const list = itemsRef.current;
      if (list.length === 0) return;

      showCountRef.current += 1;
      setIsVisible(true);

      schedule(() => {
        setIsVisible(false);
        schedule(() => {
          setCurrentIndex((prev) => (prev + 1) % list.length);
          if (showCountRef.current < MAX_SHOWS_PER_SESSION) {
            schedule(runCycle, GAP_BETWEEN_MS);
          }
        }, 400);
      }, DISPLAY_DURATION_MS);
    };

    schedule(runCycle, INITIAL_DELAY_MS);

    return () => {
      clearTimers();
    };
  }, [isPermanentlyClosed, items]);

  if (isPermanentlyClosed || items.length === 0) return null;

  const currentItem = items[currentIndex] ?? items[0];
  if (!currentItem) return null;

  return (
    <div
      data-testid="interest-popup"
      className={`
        fixed z-[80]
        left-3 right-3
        bottom-24
        sm:left-4 sm:right-auto sm:bottom-6 md:bottom-8
        sm:w-[calc(100vw-32px)] md:max-w-sm lg:max-w-md
        bg-white
        border-l-[6px] border-[#C19A6B]
        shadow-[0_10px_40px_-10px_rgba(0,0,0,0.35)]
        rounded-r-lg rounded-tl-sm rounded-bl-sm
        transition-all duration-500 ease-out
        ${isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-16 opacity-0 pointer-events-none"
        }
      `}
      aria-hidden={!isVisible}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsPermanentlyClosed(true);
        }}
        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-20 touch-target active:scale-90"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <Link
        href={`/product/${currentItem.slug}`}
        className="flex items-center gap-3 sm:gap-4 p-4 sm:p-3 pr-10 sm:pr-8 group cursor-pointer hover:bg-gray-50/50 transition-colors touch-target"
      >
        <div className="relative w-14 sm:w-16 h-14 sm:h-16 shrink-0 rounded-md overflow-hidden border border-gray-100 shadow-sm group-hover:opacity-90 transition-opacity bg-gray-100">
          {currentItem.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentItem.image}
              alt={currentItem.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 sm:gap-1.5">
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C19A6B] shrink-0" />
            <span className="font-bold text-[#C19A6B] truncate">Te podría interesar</span>
          </div>

          <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight line-clamp-1 group-hover:text-[#C19A6B] transition-colors">
            {currentItem.name}
          </p>

          <p className="text-[9px] sm:text-[10px] font-medium text-gray-500">
            {formatPrice(currentItem)}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default InterestPopup;
