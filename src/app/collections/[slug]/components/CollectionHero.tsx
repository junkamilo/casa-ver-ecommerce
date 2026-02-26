import { Sparkles } from "lucide-react";
import Image from "next/image";

interface CollectionHeroProps {
  title: string;
  description?: string | null;
  imageUrl?: string; // 🔥 Nueva propiedad para la foto de fondo
}

export default function CollectionHero({ title, description, imageUrl }: CollectionHeroProps) {
  // Lógica para separar la última palabra del resto del título
  const words = title.trim().split(" ");
  const lastWord = words.pop() || ""; 
  const firstPart = words.join(" ");  

  return (
    // Contenedor principal: Altura mínima, oscuro y relativo para la imagen de fondo
    <div className="relative w-full min-h-[40vh] sm:min-h-[50vh] flex items-center mb-12 overflow-hidden bg-[#154734]">
      
      {/* 1. IMAGEN DE FONDO CON CLOUDINARY */}
      {imageUrl && (
        <>
          <Image
            src={imageUrl}
            alt={`Colección ${title}`}
            fill
            priority
            className="object-cover object-center sm:object-[center_top]"
          />
          {/* Degradado: Oscuro a la izquierda (para leer el texto) y transparente a la derecha (para ver a las modelos) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#154734]/95 via-[#154734]/70 to-transparent" />
        </>
      )}

      {/* Fallback por si una categoría aún no tiene imagen */}
      {!imageUrl && (
        <div className="absolute inset-0 bg-[#154734] opacity-95" />
      )}

      {/* 2. CONTENIDO (Alineado a la izquierda como en tu referencia) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-2xl">
          
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-6 animate-in fade-in slide-in-from-left-4 duration-700">
            <span className="h-px w-8 sm:w-12 bg-[#C19A6B]" />
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#C19A6B] flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Nueva Colección
            </span>
          </div>

          {/* Título Principal */}
          <h1 className="text-white leading-[1.05] mb-8 animate-in fade-in slide-in-from-left-8 duration-1000 delay-150 fill-mode-both">
            {firstPart && (
              <span className="block font-bold uppercase tracking-[0.15em] text-4xl sm:text-6xl lg:text-7xl mb-2">
                {firstPart}
              </span>
            )}
            <span 
              className="block italic text-5xl sm:text-7xl lg:text-8xl" 
              style={{ fontFamily: "Georgia, serif", color: "#C19A6B" }}
            >
              {firstPart ? `${lastWord}` : lastWord}
            </span>
          </h1>

          {/* Descripción con línea lateral decorativa */}
          {description && (
            <div className="pl-4 border-l-2 border-[#C19A6B] animate-in fade-in slide-in-from-left-8 duration-1000 delay-300 fill-mode-both">
              <p className="max-w-md text-sm sm:text-base text-gray-200 leading-relaxed font-light tracking-wide">
                {description}
              </p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}