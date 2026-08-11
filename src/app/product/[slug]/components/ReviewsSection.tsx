"use client";

import Image from "next/image";
import { MessageSquare, Sparkles } from "lucide-react";
import ReviewForm from "./ReviewForm";
import type { ExistingReview } from "../types";
import type { TestimonialItem } from "@/components/layout/Testimonials/types/types";

interface Props {
  productId: string;
  rating: number;
  numReviews: number;
  existingReview: ExistingReview | null;
  isAuthenticated: boolean;
  reviews: TestimonialItem[];
}

export default function ReviewsSection({
  productId,
  existingReview,
  isAuthenticated,
  reviews,
}: Props) {
  return (
    <section className="mx-3 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 2xl:mx-auto 2xl:max-w-7xl relative rounded-2xl sm:rounded-4xl lg:rounded-[2.5rem] overflow-hidden">

      <div className="relative w-full bg-[#F2EAE0] rounded-2xl sm:rounded-4xl lg:rounded-[2.5rem] py-8 sm:py-12 lg:py-16 overflow-hidden isolate">

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#C19A6B 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }}
        />

        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8 sm:mb-10 lg:mb-14 px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="h-px w-6 sm:w-8 lg:w-12 bg-linear-to-r from-transparent to-[#C19A6B]" />
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-black tracking-[0.3em] uppercase text-[#C19A6B] flex items-center gap-1 sm:gap-1.5 drop-shadow-sm">
              <Sparkles className="w-3 h-3" />
              Comunidad
            </span>
            <span className="h-px w-6 sm:w-8 lg:w-12 bg-linear-to-l from-transparent to-[#C19A6B]" />
          </div>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-[#154734] text-center tracking-tight leading-[1.1] uppercase"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Opiniones de nuestras clientas
          </h2>
        </div>

        {/* Two-column layout */}
        <div className="relative z-10 px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-col md:flex-row gap-8 md:gap-0 bg-white rounded-2xl sm:rounded-4xl shadow-[0_20px_60px_-15px_rgba(21,71,52,0.2)] border border-[#C19A6B]/10 overflow-hidden">

            {/* Left — Form */}
            <div className="flex-1 p-6 sm:p-10 lg:p-12 flex items-start justify-center">
              <ReviewForm
                productId={productId}
                existing={existingReview}
                isAuthenticated={isAuthenticated}
              />
            </div>

            {/* Vertical divider (desktop) / Horizontal divider (mobile) */}
            <div className="hidden md:block w-px bg-gray-100 self-stretch my-8" />
            <div className="block md:hidden h-px bg-gray-100 mx-6" />

            {/* Right — Reviews list */}
            <div className="flex-1 p-6 sm:p-10 lg:p-12 flex flex-col">
              <h3
                className="text-xl sm:text-2xl lg:text-3xl font-light text-[#154734] mb-6 tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Lo que dicen nuestras clientas
              </h3>

              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center flex-1">
                  <div className="w-12 h-12 rounded-full bg-[#F2EAE0] flex items-center justify-center mb-4 shadow-inner border border-[#C19A6B]/15">
                    <MessageSquare className="w-5 h-5 text-[#C19A6B]" strokeWidth={1.2} />
                  </div>
                  <p className="text-sm text-[#154734] font-light" style={{ fontFamily: "Georgia, serif" }}>
                    Aún no hay comentarios para esta prenda.
                  </p>
                  <span className="block mt-2 text-[9px] font-black uppercase tracking-[0.25em] text-[#C19A6B]">
                    ¡Sé la primera en opinar!
                  </span>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-105 pr-2 space-y-0 scrollbar-thin scrollbar-thumb-[#C19A6B]/30 scrollbar-track-transparent">
                  {reviews.map((review, index) => (
                    <div key={index}>
                      <div className="flex items-start gap-3 py-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#154734] shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                          {review.avatarUrl ? (
                            <Image src={review.avatarUrl} alt={review.name} width={40} height={40} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[#C19A6B] font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>
                              {review.name.charAt(0)}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Name + date */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-bold text-[#154734] truncate">{review.name}</span>
                            {review.date && (
                              <span className="text-[10px] text-gray-400 font-medium shrink-0">{review.date}</span>
                            )}
                          </div>
                          {/* Comment */}
                          <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                      {index < reviews.length - 1 && (
                        <div className="h-px bg-gray-100" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
