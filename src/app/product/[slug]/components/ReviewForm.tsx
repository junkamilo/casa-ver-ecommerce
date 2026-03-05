// 2. Componente: ReviewForm.tsx

"use client";

import { useState, useTransition } from "react";
import { Star, CheckCircle, MessageSquareQuote } from "lucide-react";
import { saveReview } from "../actions";

interface ExistingReview {
  rating: number;
  comment: string | null;
}

interface Props {
  productId: string;
  productSlug: string;
  existing: ExistingReview | null;
  isAuthenticated: boolean;
}

export default function ReviewForm({
  productId,
  productSlug,
  existing,
  isAuthenticated,
}: Props) {
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);
  const [isPending, startTransition] = useTransition();

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Por favor selecciona una calificación"); return; }
    if (comment.length > 500) { setError("El comentario no puede superar los 500 caracteres"); return; }
    if (/<[^>]*>/.test(comment)) { setError("El comentario no puede contener etiquetas HTML"); return; }
    setError("");

    startTransition(async () => {
      const result = await saveReview(productId, productSlug, {
        rating,
        comment: comment || undefined,
      });
      if (result.success) {
        showToast();
      } else {
        setError(result.error ?? "Error al guardar la reseña");
      }
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center text-center w-full max-w-sm mx-auto group">
        <div className="w-20 h-20 bg-[#FAFAFA] rounded-full flex items-center justify-center shadow-inner border border-gray-100 mb-8 group-hover:scale-110 group-hover:bg-[#154734]/5 transition-all duration-500">
          <MessageSquareQuote className="w-8 h-8 text-[#C19A6B] group-hover:text-[#154734] transition-colors duration-500" strokeWidth={1.5} />
        </div>
        <h3
          className="text-3xl sm:text-4xl text-[#154734] mb-4 tracking-tight leading-[1.1]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Tu opinión es <span className="italic text-[#C19A6B]">invaluable</span>
        </h3>
        <p className="text-sm sm:text-base text-gray-500 font-light mb-10 leading-relaxed">
          Para garantizar la autenticidad de nuestras reseñas y mantener la exclusividad de
          Casa Verde, te invitamos a iniciar sesión.
        </p>
        <a
          href="/login"
          className="w-full inline-flex items-center justify-center bg-[#154734] hover:bg-[#C19A6B] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.2em] px-8 py-4 sm:py-5 rounded-xl shadow-[0_10px_20px_-10px_rgba(21,71,52,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(193,154,107,0.6)] transition-all duration-500 active:scale-95"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <div className="w-full relative max-w-md mx-auto">

      {/* Toast reseña guardada */}
      <div
        aria-live="polite"
        className={`absolute -top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-[#C19A6B]/30 text-[#154734] shadow-[0_20px_40px_-10px_rgba(193,154,107,0.3)] rounded-2xl px-5 py-3 transition-all duration-500 w-max ${
          toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <CheckCircle className="w-5 h-5 text-[#C19A6B]" />
        <span className="text-xs sm:text-sm font-bold tracking-wide">¡Reseña guardada!</span>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        
        <div className="text-center mb-8">
          <h3
            className="text-3xl sm:text-4xl text-[#154734] mb-3 tracking-tight leading-[1.1]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {existing ? "Actualiza tu " : "Déjanos tu "}
            <span className="italic text-[#C19A6B]">
              {existing ? "reseña" : "opinión"}
            </span>
          </h3>
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-gray-400">
            ¿Cómo calificarías este producto?
          </p>
        </div>

        {/* Estrellas interactivas */}
        <div className="flex gap-2 sm:gap-3 bg-[#FAFAFA] px-6 py-3 sm:py-4 rounded-full border border-gray-100 shadow-inner mb-8" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={isPending}
              onMouseEnter={() => setHover(star)}
              onClick={() => setRating(star)}
              className="text-[#C19A6B] transition-all duration-300 hover:scale-125 active:scale-95 disabled:cursor-default disabled:hover:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#154734] focus-visible:ring-offset-2 rounded-full"
              aria-label={`Calificar con ${star} estrella${star !== 1 ? "s" : ""}`}
            >
              <Star
                className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-300 ${
                  star <= (hover || rating)
                    ? "fill-current drop-shadow-[0_0_10px_rgba(193,154,107,0.5)]"
                    : "fill-none text-gray-300"
                }`}
                strokeWidth={1.2}
              />
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div className="w-full relative group/textarea mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos tu experiencia con el tejido, el ajuste y la comodidad..."
            rows={4}
            maxLength={500}
            className="w-full text-sm bg-[#FAFAFA] border border-gray-200 rounded-2xl px-5 py-4 sm:py-5 resize-none outline-none focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 transition-all duration-300 placeholder:text-gray-400 placeholder:font-light text-[#154734] shadow-inner group-hover/textarea:shadow-md"
          />
          <span
            className={`absolute bottom-3 right-4 text-[10px] sm:text-xs font-medium pointer-events-none transition-colors duration-300 ${
              comment.length >= 450 ? "text-[#C19A6B]" : "text-gray-400"
            }`}
          >
            {comment.length}/500
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-xs px-5 py-3 rounded-xl font-medium w-full text-center border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-2 mb-4">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || rating === 0}
          className="w-full bg-[#154734] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.2em] px-8 py-4 sm:py-5 rounded-xl hover:bg-[#C19A6B] shadow-[0_10px_20px_-10px_rgba(21,71,52,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(193,154,107,0.6)] transition-all duration-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#154734] disabled:hover:shadow-none disabled:active:scale-100 flex items-center justify-center gap-3 relative overflow-hidden group/btn"
        >
          <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
          <span className="relative z-10 flex items-center gap-2">
            {isPending ? (
              <span className="animate-pulse">Guardando…</span>
            ) : existing ? (
              "Actualizar reseña"
            ) : (
              "Publicar reseña"
            )}
          </span>
        </button>
      </form>
    </div>
  );
}