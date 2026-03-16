"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, CheckCircle2 } from "lucide-react";

interface SaleItem {
  name: string;
  location: string;
  productName: string;
  timeAgo: string;
  image: string | null;
  slug: string;
}

const DISPLAY_DURATION = 5000;
const INTERVAL_DURATION = 12000;

const SocialProofPopup = () => {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPermanentlyClosed, setIsPermanentlyClosed] = useState(false);

  useEffect(() => {
    fetch("/api/recent-sales")
      .then((r) => r.json())
      .then((data: SaleItem[]) => {
        if (Array.isArray(data) && data.length > 0) setSales(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isPermanentlyClosed || sales.length === 0) return;

    const runCycle = () => {
      setIsVisible(true);
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % sales.length);
        }, 500);
      }, DISPLAY_DURATION);
      return hideTimer;
    };

    const initialTimeout = setTimeout(() => {
      runCycle();
      const intervalId = setInterval(runCycle, INTERVAL_DURATION);
      return () => clearInterval(intervalId);
    }, 4000);

    return () => clearTimeout(initialTimeout);
  }, [isPermanentlyClosed, sales]);

  if (isPermanentlyClosed || sales.length === 0) return null;

  const currentItem = sales[currentIndex];

  return (
    <div
      className={`
        fixed z-[9999]
        left-3 sm:left-4
        bottom-4 sm:bottom-6 md:bottom-8
        w-[calc(100vw-24px)] sm:w-[calc(100vw-32px)] md:max-w-sm lg:max-w-md
        bg-white
        border-l-[4px] sm:border-l-[6px] border-[#154734]
        shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)]
        rounded-r-lg rounded-tl-sm rounded-bl-sm
        transition-all duration-700 cubic-bezier(0.25, 0.8, 0.25, 1)
        ${isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-20 opacity-0 pointer-events-none"
        }
      `}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsPermanentlyClosed(true);
        }}
        className="absolute top-2 right-2 sm:top-1 sm:right-1 p-1.5 sm:p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors z-20 touch-target active:scale-90"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <Link
        href={`/product/${currentItem.slug}`}
        className="flex items-center gap-3 sm:gap-4 p-4 sm:p-3 pr-10 sm:pr-8 group cursor-pointer hover:bg-gray-50/50 transition-colors touch-target"
      >
        <div className="relative w-14 sm:w-16 h-14 sm:h-16 shrink-0 rounded-md overflow-hidden border border-gray-100 shadow-sm group-hover:opacity-90 transition-opacity">
          {currentItem.image ? (
            <Image
              src={currentItem.image}
              alt={currentItem.productName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 sm:gap-1.5">
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500">
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#154734] shrink-0" />
            <span className="truncate">
              <span className="font-bold text-[#154734]">{currentItem.name}</span> de {currentItem.location}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight line-clamp-1 group-hover:text-[#154734] transition-colors">
            Compró {currentItem.productName}
          </p>

          <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 flex items-center gap-1">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C19A6B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C19A6B]"></span>
            </span>
            {currentItem.timeAgo}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default SocialProofPopup;
