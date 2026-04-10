"use client";

import { useState, useRef, useEffect } from "react";
import { Film } from "lucide-react";

interface Props {
  url: string;
}

function normalizeCloudinaryVideoUrl(url: string): string {
  return url.replace(/\.(mov|avi|webm|mkv)(\?.*)?$/, ".mp4$2");
}

export default function ProductVideo({ url }: Props) {
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const normalizedUrl = normalizeCloudinaryVideoUrl(url);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (hasError) {
    return (
      <div className="w-full h-full bg-[#FAFAFA] flex flex-col items-center justify-center p-8 text-center transition-all duration-500 ease-out group">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 group-hover:bg-[#154734]/5 transition-all duration-500">
          <Film className="w-6 h-6 sm:w-7 sm:h-7 text-[#C19A6B] group-hover:text-[#154734] transition-colors duration-500" strokeWidth={1.5} />
        </div>
        <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#154734] mb-2">
          Lookbook
        </p>
        <p className="text-[10px] sm:text-xs font-light text-gray-500 leading-relaxed px-4">
          El video no está disponible en este momento.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-50 overflow-hidden isolate">

      {/* Skeleton de carga (Fondo animado) */}
      <div className="absolute inset-0 bg-linear-to-tr from-gray-200 via-gray-100 to-gray-200 animate-pulse -z-10" />

      {/* Anillo interior sutil para un acabado de marco premium */}
      <div className="absolute inset-0 ring-1 ring-inset ring-black/5 z-20 pointer-events-none rounded-4xl" />

      {isVisible && (
        <video
          src={normalizedUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover object-center absolute inset-0 z-0 transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
        />
      )}

      {/* Overlay Cinemático */}
      <div className="absolute inset-0 bg-linear-to-t from-[#154734]/80 via-transparent to-transparent pointer-events-none z-10 opacity-70 group-hover:opacity-40 transition-opacity duration-700 ease-in-out" />

    </div>
  );
}
