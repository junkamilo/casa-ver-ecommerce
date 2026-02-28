// Reemplaza tu archivo ProductVideo.tsx completo con este código:

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
      <div className="w-full h-full bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-[#C19A6B]/30 rounded-[1.5rem] transition-all duration-300 hover:border-[#C19A6B]/60 hover:bg-white">
        <div className="w-14 h-14 rounded-full bg-[#154734]/5 flex items-center justify-center mb-4 shadow-inner">
          <Film className="w-6 h-6 text-[#C19A6B]" strokeWidth={1.5} />
        </div>
        <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#154734] mb-2">
          Lookbook
        </p>
        <p className="text-xs font-light text-gray-500">
          El video no está disponible en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group bg-[#154734]/10 overflow-hidden rounded-[1.5rem] isolate">
      
      {/* Skeleton de carga (Fondo animado) */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-[#FAFAFA] to-gray-300 animate-pulse -z-10" />

      <video
        src={normalizedUrl}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover absolute inset-0 z-0 transition-transform duration-1000 ease-out group-hover:scale-[1.05]" 
      />

      {/* Overlay Cinemático Profundo */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#154734]/80 via-transparent to-black/30 pointer-events-none z-10 opacity-70 group-hover:opacity-30 transition-opacity duration-700 ease-in-out" />

      {/* Etiqueta Flotante "En Vivo" (Look de pasarela) */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2.5 shadow-lg transition-transform duration-500 group-hover:scale-105">
          <span className="w-2 h-2 rounded-full bg-[#C19A6B] animate-pulse shadow-[0_0_10px_#C19A6B]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white drop-shadow-md">
            En Movimiento
          </span>
        </div>
      </div> 
    </div>
  );
}