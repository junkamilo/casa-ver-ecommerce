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
      <div className="bg-[#FAFAFA] border border-[#C19A6B]/20 rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center max-w-2xl mx-auto shadow-sm">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
          <MessageSquareQuote className="w-5 h-5 text-[#C19A6B]" strokeWidth={1.5} />
        </div>
        <h3
          className="text-2xl text-[#154734] mb-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Tu opinión es invaluable
        </h3>
        <p className="text-sm text-gray-500 font-light max-w-md mb-6 leading-relaxed">
          Para garantizar la autenticidad de nuestras reseñas y mantener la exclusividad de
          Casa Verde, te invitamos a iniciar sesión.
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center bg-[#154734] hover:bg-[#103a2a] text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#154734]/20 transition-all duration-300 active:scale-95"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* Toast reseña guardada */}
      <div
        aria-live="polite"
        className={`fixed top-6 right-6 z-[200] flex items-center gap-4 bg-[#154734] text-white shadow-2xl rounded-xl px-5 py-4 transition-all duration-500 ${
          toast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8 pointer-events-none"
        }`}
      >
        <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide">¡Gracias por tu reseña!</p>
          <p className="text-xs text-white/70 mt-0.5">Se ha guardado correctamente.</p>
        </div>
      </div>

      <div className="bg-[#FAFAFA] border border-gray-100 rounded-[2rem] p-6 sm:p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6">

          <div className="text-center mb-2">
            <h3
              className="text-2xl sm:text-3xl text-[#154734] mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {existing ? "Actualiza tu reseña" : "Déjanos tu opinión"}
            </h3>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              ¿Cómo calificarías este producto?
            </p>
          </div>

          {/* Estrellas interactivas */}
          <div className="flex gap-2" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={isPending}
                onMouseEnter={() => setHover(star)}
                onClick={() => setRating(star)}
                className="text-[#C19A6B] transition-all duration-200 hover:scale-110 active:scale-95 disabled:cursor-default disabled:hover:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] focus-visible:ring-offset-2 rounded"
                aria-label={`Calificar con ${star} estrella${star !== 1 ? "s" : ""}`}
              >
                <Star
                  className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors duration-300 ${
                    star <= (hover || rating)
                      ? "fill-current drop-shadow-sm"
                      : "fill-none text-gray-300"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>

          {/* Textarea */}
          <div className="w-full relative mt-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos tu experiencia con el tejido, el ajuste y la comodidad de esta prenda..."
              rows={4}
              maxLength={500}
              className="w-full text-sm sm:text-base bg-white border border-gray-200 rounded-xl px-5 py-4 resize-none focus:outline-none focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 transition-all placeholder:text-gray-400 placeholder:font-light text-[#154734]"
            />
            <span
              className={`absolute bottom-3 right-4 text-xs pointer-events-none ${
                comment.length >= 450 ? "text-[#C19A6B] font-medium" : "text-gray-400"
              }`}
            >
              {comment.length}/500
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 text-xs px-4 py-2.5 rounded-lg font-medium w-full text-center border border-red-100">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || rating === 0}
            className="w-full sm:w-auto mt-2 bg-[#154734] text-white text-xs font-bold uppercase tracking-widest px-10 py-4 rounded-xl hover:bg-[#103a2a] shadow-md hover:shadow-lg hover:shadow-[#154734]/20 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <span className="animate-pulse">Guardando…</span>
            ) : existing ? (
              "Actualizar reseña"
            ) : (
              "Publicar reseña"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
