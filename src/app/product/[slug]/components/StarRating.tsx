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
    <div className="relative flex flex-col items-center justify-center p-8 sm:p-10 bg-white rounded-[2.5rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_50px_-12px_rgba(193,154,107,0.15)] hover:-translate-y-1 transition-all duration-500 ease-in-out max-w-sm mx-auto group overflow-hidden border border-gray-50">
      
      {/* Resplandor superior dorado animado */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#C19A6B] to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500 ease-in-out" />

      {/* 1. Número Promedio Editorial */}
      <div className="flex items-baseline gap-1.5 mb-6">
        <span 
          className="text-6xl font-light text-[#154734] tracking-tighter transition-transform duration-500 group-hover:scale-105" 
          style={{ fontFamily: "Georgia, serif" }}
        >
          {rating.toFixed(1)}
        </span>
        <span className="text-xl text-gray-300 font-light">/ 5</span>
      </div>

      {/* 2. Estrellas con Micro-interacciones */}
      <div
        className="flex gap-2.5 mb-6 bg-[#FAFAFA] px-6 py-3.5 rounded-full border border-gray-100 shadow-inner"
        onMouseLeave={() => !submitted && setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={submitted || isPending}
            onMouseEnter={() => !submitted && setHover(star)}
            onClick={() => handleRate(star)}
            className="text-[#C19A6B] transition-all duration-300 hover:scale-125 active:scale-95 disabled:cursor-default disabled:hover:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#154734] focus-visible:ring-offset-2 rounded-full"
            aria-label={`Calificar con ${star} estrellas`}
          >
            <Star
              className={`w-8 h-8 sm:w-9 sm:h-9 transition-all duration-300 ${
                star <= filled
                  ? "fill-current drop-shadow-[0_0_10px_rgba(193,154,107,0.4)]"
                  : "fill-none text-gray-200"
              }`}
              strokeWidth={1.2}
            />
          </button>
        ))}
      </div>

      {/* 3. Contenedor de Textos Animado (Evita saltos de altura) */}
      <div className="relative h-12 w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Estado Default / Loading */}
        <div 
          className={`absolute flex flex-col items-center transition-all duration-500 ease-in-out transform ${
            submitted ? 'translate-y-full opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'
          }`}
        >
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#154734] font-bold mb-1.5">
            Basado en <span className="text-[#C19A6B]">{count}</span> reseña{count !== 1 ? "s" : ""}
          </p>
          <p className="text-[10px] sm:text-[11px] text-gray-400 font-light italic transition-colors duration-300 group-hover:text-gray-500">
            {isPending ? "Registrando voto..." : "Haz clic para calificar"}
          </p>
        </div>

        {/* Estado Éxito */}
        <div 
          className={`absolute flex items-center gap-2.5 text-[#154734] transition-all duration-500 ease-in-out transform ${
            submitted ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95'
          }`}
        >
          <div className="bg-[#154734]/10 rounded-full p-1.5">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C19A6B]" />
          </div>
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em]">
            ¡Gracias por calificar!
          </span>
        </div>

      </div>
    </div>
  );
}