// 2. Archivo ProductVideo.tsx completo

"use client";

import { useState } from "react";
import { Film } from "lucide-react";

interface Props {
  url: string;
}

function normalizeCloudinaryVideoUrl(url: string): string {
  return url.replace(/\.(mov|avi|webm|mkv)(\?.*)?$/, ".mp4$2");
}

export default function ProductVideo({ url }: Props) {
  const [hasError, setHasError] = useState(false);
  const normalizedUrl = normalizeCloudinaryVideoUrl(url);

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
    <div className="relative w-full h-full bg-gray-50 overflow-hidden isolate">

      {/* Skeleton de carga (Fondo animado) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 via-gray-100 to-gray-200 animate-pulse -z-10" />

      {/* Anillo interior sutil para un acabado de marco premium */}
      <div className="absolute inset-0 ring-1 ring-inset ring-black/5 z-20 pointer-events-none rounded-[2rem]" />

      <video
        src={normalizedUrl}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover object-center absolute inset-0 z-0 transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
      />

      {/* Overlay Cinemático */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#154734]/80 via-transparent to-transparent pointer-events-none z-10 opacity-70 group-hover:opacity-40 transition-opacity duration-700 ease-in-out" />

      {/* Etiqueta Flotante "En Movimiento" */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <div className="bg-black/25 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg transition-transform duration-500 group-hover:scale-105 group-hover:bg-black/40">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C19A6B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#C19A6B]"></span>
          </span>
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] text-white drop-shadow-md mt-px">
            En Movimiento
          </span>
        </div>
      </div>
    </div>
  );
}