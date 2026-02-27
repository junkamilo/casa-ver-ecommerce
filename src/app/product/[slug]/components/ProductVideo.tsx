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

  // ESTADO DE ERROR (Elegante y acorde a la marca)
  if (hasError) {
    return (
      <div className="w-full h-full bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-[#C19A6B]/20">
        <div className="w-12 h-12 rounded-full bg-[#154734]/5 flex items-center justify-center mb-3">
          <Film className="w-5 h-5 text-[#C19A6B]" strokeWidth={1.5} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#154734] mb-1">
          Lookbook
        </p>
        <p className="text-xs font-light text-gray-400">
          El video no está disponible en este momento.
        </p>
      </div>
    );
  }

  // REPRODUCTOR PREMIUM
  return (
    <div className="relative w-full h-full group bg-[#154734]/5 overflow-hidden">
      
      {/* Skeleton / Placeholder de carga (Fondo animado) */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-[#FAFAFA] to-gray-200 animate-pulse -z-10" />

      <video
        src={normalizedUrl}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover absolute inset-0 z-0" 
      />

      {/* 1. Overlay Cinemático: Gradiente sutil para darle profundidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none z-10 opacity-60 group-hover:opacity-30 transition-opacity duration-700" />

      {/* 2. Etiqueta Flotante "En Vivo" (Look de pasarela) */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <div className="bg-black/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white drop-shadow-md">
            Lookbook
          </span>
        </div>
      </div>

      {/* 3. Marca de Agua Inferior (Aparece al hacer Hover) */}
      <div className="absolute bottom-8 left-0 w-full flex justify-center z-20 pointer-events-none">
        <span className="text-white/90 text-xs tracking-[0.5em] uppercase font-bold drop-shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
          Casa Verde
        </span>
      </div>
      
    </div>
  );
}