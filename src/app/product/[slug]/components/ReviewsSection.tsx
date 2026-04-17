"use client";

import { Star } from "lucide-react";
import ReviewForm from "./ReviewForm";
import type { ExistingReview } from "../types";

interface Props {
  productId: string;
  rating: number;
  numReviews: number;
  existingReview: ExistingReview | null;
  isAuthenticated: boolean;
  reviews: { rating: number }[];
}

export default function ReviewsSection({
  productId,
  rating,
  numReviews,
  existingReview,
  isAuthenticated,
  reviews,
}: Props) {
  const rounded = Math.round(rating);

  // Distribución real por nivel de estrella
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <section className="py-8 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-360 mx-auto w-full flex justify-center">
      <div className="w-full max-w-6xl">

        {/* Cabecera */}
        <div className="flex flex-col items-center justify-center mb-6 sm:mb-16 px-4">
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl font-light text-[#154734] text-center leading-[1.1] tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Voces de nuestras clientas
          </h2>
        </div>

        {/* Contenedor Unificado (50/50) */}
        <div className="flex flex-col lg:flex-row w-full rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(21,71,52,0.25)] border border-gray-100 bg-white">

          {/* Columna Izquierda: Estadísticas (Verde) */}
          <div className="w-full lg:w-1/2 bg-[#154734] p-6 sm:p-14 lg:p-16 relative flex flex-col justify-center isolate">
            {/* Decoración de fondo */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{ backgroundImage: "radial-gradient(#C19A6B 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }}
            />
            <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-[#C19A6B]/30 via-[#C19A6B] to-[#C19A6B]/30 opacity-80" />

            <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center">
              <h3 className="text-white/80 text-[10px] sm:text-sm font-bold tracking-[0.3em] uppercase mb-4 sm:mb-8 text-center">
                Calificación General
              </h3>

              <div className="text-center mb-5 sm:mb-10">
                <p
                  className="text-6xl sm:text-8xl lg:text-9xl font-light text-white mb-3 sm:mb-4 tracking-tighter drop-shadow-md"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {rating.toFixed(1)}
                </p>
                <div className="flex text-[#C19A6B] justify-center mb-3 sm:mb-5 gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 sm:w-7 sm:h-7 ${
                        star <= rounded ? "fill-current drop-shadow-[0_0_8px_rgba(193,154,107,0.5)] scale-110" : "fill-none text-white/20"
                      } transition-all duration-300`}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <p className="text-[10px] sm:text-sm text-white/60 uppercase tracking-widest font-medium">
                  Basado en <span className="text-[#C19A6B] font-bold">{numReviews}</span> reseña{numReviews !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Barras de distribución real */}
              <div className="w-full space-y-3 sm:space-y-4">
                {distribution.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-3 sm:gap-4 text-xs group cursor-default">
                    <div className="flex text-[#C19A6B] shrink-0 transition-transform duration-300 group-hover:scale-105">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                            i <= star ? "fill-current" : "text-white/10 fill-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex-1 h-2 sm:h-2.5 bg-black/20 rounded-full overflow-hidden shadow-inner border border-white/5">
                      <div
                        className="h-full bg-linear-to-r from-[#C19A6B] to-[#e0bc94] rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: numReviews > 0 ? `${(count / maxCount) * 100}%` : "0%" }}
                      >
                        <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                    <span className="w-5 sm:w-6 text-right text-white/70 font-bold group-hover:text-white transition-colors duration-300">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Formulario (Blanco) */}
          <div className="w-full lg:w-1/2 bg-white p-6 sm:p-14 lg:p-16 flex items-center justify-center relative">
            <ReviewForm
              productId={productId}
              existing={existingReview}
              isAuthenticated={isAuthenticated}
            />
          </div>

        </div>
      </div>
    </section>
  );
}