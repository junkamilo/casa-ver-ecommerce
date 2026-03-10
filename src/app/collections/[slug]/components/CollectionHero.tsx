"use client";

import { Sparkles } from "lucide-react";
import Image from "next/image";

interface CollectionHeroProps {
  title: string;
  description?: string | null;
  imageUrl?: string;
}

export default function CollectionHero({ title, description, imageUrl }: CollectionHeroProps) {
  // Lógica para separar la última palabra del resto del título
  const words = title.trim().split(" ");
  const lastWord = words.pop() || ""; 
  const firstPart = words.join(" ");  

  return (
    <div className="relative w-full min-h-[40vh] sm:min-h-[50vh] flex items-center overflow-hidden bg-[#154734] rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_20px_50px_-15px_rgba(21,71,52,0.4)] group isolate border border-[#C19A6B]/20">
      
      {/* Acento decorativo superior dorado */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#C19A6B] to-transparent opacity-70 z-20" />

      {/* Patrón de fondo premium sutil */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none z-10" 
        style={{ backgroundImage: "radial-gradient(#C19A6B 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }} 
      />

      {/* 1. IMAGEN DE FONDO CON EFECTO PARALLAX SUTIL */}
      {imageUrl ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={imageUrl}
            alt={`Colección ${title}`}
            fill
            priority
            className="object-cover object-center sm:object-[center_top] transition-transform duration-[2000ms] ease-out group-hover:scale-[1.03]"
          />
          {/* Overlay Cinemático Profundo */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#154734]/95 via-[#154734]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#154734]/80 via-transparent to-transparent opacity-60" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#154734] to-[#0a2419]">
           {/* Luces decorativas si no hay imagen */}
           <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#C19A6B] opacity-[0.04] rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        </div>
      )}

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-16 sm:py-24">
        <div className="max-w-2xl">
          
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-6 animate-in fade-in slide-in-from-left-4 duration-700">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#C19A6B]" />
            <span className="text-[10px] sm:text-xs font-black tracking-[0.4em] uppercase text-[#C19A6B] flex items-center gap-2 drop-shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Colección Exclusiva
            </span>
          </div>

          {/* Título Principal */}
          <h1 className="text-white leading-[1.05] mb-8 animate-in fade-in slide-in-from-left-8 duration-1000 delay-150 fill-mode-both">
            {firstPart && (
              <span className="block font-bold uppercase tracking-[0.15em] text-4xl sm:text-5xl lg:text-6xl mb-2 drop-shadow-md">
                {firstPart}
              </span>
            )}
            <span 
              className="block italic text-5xl sm:text-6xl lg:text-7xl drop-shadow-lg" 
              style={{ fontFamily: "Georgia, serif", color: "#C19A6B" }}
            >
              {firstPart ? `${lastWord}` : lastWord}
            </span>
          </h1>

          {/* Descripción con bloque decorativo de cristal */}
          {description && (
            <div className="pl-5 border-l-2 border-[#C19A6B]/50 bg-gradient-to-r from-[#154734]/40 to-transparent py-3 pr-4 rounded-r-2xl backdrop-blur-sm animate-in fade-in slide-in-from-left-8 duration-1000 delay-300 fill-mode-both">
              <p className="max-w-md text-sm sm:text-base text-gray-200 leading-relaxed font-light tracking-wide drop-shadow-sm">
                {description}
              </p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}