"use client";

import { useState, useTransition } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { rateProduct } from "../actions";

interface Props {
  productId: string;
  productSlug: string;
  initialRating: number;
  initialCount: number;
}

export default function StarRating({
  productId,
  productSlug,
  initialRating,
  initialCount,
}: Props) {
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(initialRating);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const handleRate = (value: number) => {
    if (submitted || isPending) return;

    const newCount = count + 1;
    const newRating = (rating * count + value) / newCount;
    setRating(newRating);
    setCount(newCount);
    setSubmitted(true);

    startTransition(async () => {
      await rateProduct(productId, productSlug, value);
    });
  };

  const filled = hover || Math.round(rating);

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-[#FAFAFA] border border-[#C19A6B]/10 rounded-[2rem] shadow-sm max-w-xs mx-auto transition-all hover:shadow-md">
      
      {/* 1. Número Promedio Editorial */}
      <div className="flex items-baseline gap-1 mb-5">
        <span 
          className="text-5xl font-light text-[#154734] tracking-tighter" 
          style={{ fontFamily: "Georgia, serif" }}
        >
          {rating.toFixed(1)}
        </span>
        <span className="text-lg text-gray-400 font-light">/ 5</span>
      </div>

      {/* 2. Estrellas con Micro-interacciones */}
      <div
        className="flex gap-2 mb-4"
        onMouseLeave={() => !submitted && setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={submitted || isPending}
            onMouseEnter={() => !submitted && setHover(star)}
            onClick={() => handleRate(star)}
            className="text-[#C19A6B] transition-all duration-300 hover:scale-125 hover:-translate-y-1 active:scale-95 disabled:cursor-default disabled:hover:scale-100 disabled:hover:translate-y-0 focus:outline-none"
            aria-label={`Calificar con ${star} estrellas`}
          >
            <Star
              className={`w-7 h-7 transition-all duration-500 ${
                star <= filled
                  ? "fill-current drop-shadow-md scale-110"
                  : "fill-none text-gray-300 scale-100"
              }`}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>

      {/* 3. Contenedor de Textos Animado (Evita saltos de altura) */}
      <div className="relative h-10 w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Estado Default / Loading */}
        <div 
          className={`absolute flex flex-col items-center transition-all duration-500 transform ${
            submitted ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-bold mb-1">
            Basado en {count} reseña{count !== 1 ? "s" : ""}
          </p>
          <p className="text-[10px] text-gray-400/80 font-light italic">
            {isPending ? "Registrando voto..." : "Haz clic para calificar"}
          </p>
        </div>

        {/* Estado Éxito */}
        <div 
          className={`absolute flex items-center gap-2 text-[#154734] transition-all duration-500 transform ${
            submitted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-[#C19A6B]" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em]">
            ¡Gracias por calificar!
          </span>
        </div>

      </div>
    </div>
  );
}