// 1. Componente: ReviewsSection.tsx

"use client";

import { Star, Sparkles } from "lucide-react";
import ReviewForm from "./ReviewForm";

interface ExistingReview {
  rating: number;
  comment: string | null;
}

interface Props {
  productId: string;
  productSlug: string;
  rating: number;
  numReviews: number;
  existingReview: ExistingReview | null;
  isAuthenticated: boolean;
}

export default function ReviewsSection({
  productId,
  productSlug,
  rating,
  numReviews,
  existingReview,
  isAuthenticated,
}: Props) {
  const rounded = Math.round(rating);

  return (
    <section className="py-20 sm:py-32 relative overflow-hidden bg-[#154734] rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl mx-4 sm:mx-6 lg:mx-8 xl:mx-12 mb-24">
      
      {/* Fondo decorativo sutil dorado */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: "radial-gradient(#C19A6B 1px, transparent 1px)", backgroundSize: "32px 32px" }} 
      />
      
      {/* Resplandor superior dorado */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 sm:w-1/2 h-1 bg-gradient-to-r from-transparent via-[#C19A6B] to-transparent opacity-80" />

      {/* Cabecera editorial */}
      <div className="relative z-10 flex flex-col items-center justify-center mb-16 sm:mb-20 px-4">
        <div className="flex items-center gap-4 mb-6">
          <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#C19A6B]" />
          <span className="text-[10px] sm:text-xs font-black tracking-[0.5em] uppercase text-[#C19A6B] flex items-center gap-2 drop-shadow-md">
            <Sparkles className="w-4 h-4" />
            Testimonios
          </span>
          <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#C19A6B]" />
        </div>
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl text-white text-center leading-none tracking-tight"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Voces de nuestras <span className="italic text-[#C19A6B]">clientas</span>
        </h2>
      </div>

      <div className="relative z-10 grid lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 max-w-7xl mx-auto items-start px-6 sm:px-12 lg:px-16">
        
        {/* Tarjeta de estadísticas (Blanco para profundidad) */}
        <div className="lg:col-span-5 bg-white rounded-[2rem] p-10 sm:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.25)] hover:shadow-[0_30px_60px_rgba(193,154,107,0.15)] hover:-translate-y-2 transition-all duration-500 ease-in-out flex flex-col items-center justify-center relative overflow-hidden group">
          
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#C19A6B] to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="text-center mb-10">
            <p
              className="text-7xl sm:text-8xl font-light text-[#154734] mb-4 tracking-tighter transition-transform duration-500 group-hover:scale-105"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {rating.toFixed(1)}
            </p>
            <div className="flex text-[#C19A6B] justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 ${
                    star <= rounded ? "fill-current drop-shadow-md scale-110" : "fill-none text-gray-200"
                  }`}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-widest font-bold">
              Basado en <span className="text-[#C19A6B]">{numReviews}</span> reseña{numReviews !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Barras de distribución (Acentos dorados) */}
          <div className="w-full max-w-sm space-y-4">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-4 text-xs group/bar cursor-default">
                <div className="flex text-[#C19A6B] shrink-0 transition-transform duration-300 group-hover/bar:scale-110">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i <= star ? "fill-current" : "text-gray-200 fill-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex-1 h-2 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-[#C19A6B] to-[#e0bc94] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: star === rounded ? "100%" : "0%" }}
                  />
                </div>
                <span className="w-5 text-right text-gray-400 font-bold group-hover/bar:text-[#154734] transition-colors duration-300">
                  {star === rounded ? numReviews : 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario (Blanco para profundidad) */}
        <div className="lg:col-span-7 flex items-center justify-center w-full">
          <ReviewForm
            productId={productId}
            productSlug={productSlug}
            existing={existingReview}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </section>
  );
}
