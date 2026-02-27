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
    <section className="py-16 sm:py-24 border-t border-gray-100">

      {/* Cabecera editorial */}
      <div className="flex flex-col items-center justify-center mb-16">
        <div className="flex items-center gap-4 mb-4">
          <span className="h-px w-8 sm:w-12 bg-linear-to-r from-transparent to-[#C19A6B]" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#C19A6B] flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Testimonios
          </span>
          <span className="h-px w-8 sm:w-12 bg-linear-to-l from-transparent to-[#C19A6B]" />
        </div>
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-[#154734] text-center px-4"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Voces de nuestras clientas
        </h2>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 xl:gap-12 max-w-6xl mx-auto items-start px-4 sm:px-6">

        {/* Tarjeta de estadísticas */}
        <div className="lg:col-span-5 bg-[#FAFAFA] rounded-[2rem] p-8 sm:p-12 border border-[#C19A6B]/10 shadow-sm flex flex-col items-center justify-center">

          <div className="text-center mb-8">
            <p
              className="text-6xl sm:text-7xl font-light text-[#154734] mb-4 tracking-tighter"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {rating.toFixed(1)}
            </p>
            <div className="flex text-[#C19A6B] justify-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 sm:w-7 sm:h-7 ${
                    star <= rounded ? "fill-current drop-shadow-sm" : "fill-none text-gray-300"
                  }`}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-widest font-medium">
              Basado en {numReviews} reseña{numReviews !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Barras de distribución */}
          <div className="w-full max-w-[280px] space-y-3">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3 text-xs">
                <div className="flex text-[#C19A6B] shrink-0">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i <= star ? "fill-current" : "text-gray-300 fill-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#154734] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: star === rounded ? "100%" : "0%" }}
                  />
                </div>
                <span className="w-4 text-right text-gray-500 font-semibold">
                  {star === rounded ? numReviews : 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario */}
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
