"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Star, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface ReviewInfo {
  reviewId: string;
  productId: string;
  productName: string;
  productSlug: string;
  orderNumber: string;
  reviewerName: string;
}

type PageState = "loading" | "form" | "success" | "error";

export default function ResenasPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<PageState>("loading");
  const [info, setInfo] = useState<ReviewInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMsg("No se encontró un enlace válido.");
      setState("error");
      return;
    }

    fetch(`/api/reviews/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setErrorMsg(data.error);
          setState("error");
        } else {
          setInfo(data);
          setState("form");
        }
      })
      .catch(() => {
        setErrorMsg("Ocurrió un error. Intenta de nuevo más tarde.");
        setState("error");
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (comment.trim().length < 5) {
      setFormError("Tu comentario es muy corto. Cuéntanos un poco más 💚");
      return;
    }
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/reviews/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        setState("success");
      } else {
        setFormError(data.error ?? "No se pudo enviar tu reseña.");
      }
    } catch {
      setFormError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F2EAE0] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link href="/">
            <span
              className="text-2xl font-bold text-[#154734] tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Casa Verde
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(21,71,52,0.2)] border border-[#C19A6B]/10 overflow-hidden">

          {/* Loading */}
          {state === "loading" && (
            <div className="flex flex-col items-center justify-center py-20 px-8">
              <Loader2 className="w-10 h-10 text-[#154734] animate-spin mb-4" />
              <p className="text-sm text-gray-500">Cargando tu enlace de reseña...</p>
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Enlace inválido</h2>
              <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
              <Link
                href="/"
                className="text-sm font-semibold text-[#154734] underline underline-offset-2"
              >
                Volver al inicio
              </Link>
            </div>
          )}

          {/* Form */}
          {state === "form" && info && (
            <form onSubmit={handleSubmit} className="p-8 sm:p-10">
              <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C19A6B]">
                  Pedido #{info.orderNumber}
                </span>
                <h1
                  className="text-2xl sm:text-3xl font-light text-[#154734] mt-1 leading-tight"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  ¿Cómo te quedó?
                </h1>
                <p className="text-sm text-gray-500 mt-2">
                  Deja tu opinión sobre{" "}
                  <span className="font-semibold text-[#154734]">{info.productName}</span>
                </p>
              </div>

              {/* Star rating */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">
                  Calificación
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-9 h-9 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-[#C19A6B] text-[#C19A6B]"
                            : "fill-gray-200 text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label
                  htmlFor="comment"
                  className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2"
                >
                  Tu comentario
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos cómo te quedó, si la talla fue la esperada, la calidad de la tela..."
                  rows={5}
                  maxLength={1000}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154734]/30 focus:border-[#154734] resize-none transition"
                />
                <div className="flex justify-between mt-1">
                  {formError ? (
                    <span className="text-xs text-red-500">{formError}</span>
                  ) : (
                    <span />
                  )}
                  <span className="text-[11px] text-gray-400">{comment.length}/1000</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#154734] text-white font-semibold py-3.5 rounded-xl text-sm hover:bg-[#154734]/90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar mi reseña"
                )}
              </button>

              <p className="text-center text-[11px] text-gray-400 mt-4">
                Tu reseña será visible después de ser revisada por nuestro equipo.
              </p>
            </form>
          )}

          {/* Success */}
          {state === "success" && (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F2EAE0] flex items-center justify-center mb-5 border border-[#C19A6B]/20">
                <CheckCircle className="w-8 h-8 text-[#154734]" />
              </div>
              <h2
                className="text-2xl font-light text-[#154734] mb-3"
                style={{ fontFamily: "Georgia, serif" }}
              >
                ¡Gracias por tu reseña!
              </h2>
              <p className="text-sm text-gray-500 mb-6 max-w-xs">
                La revisaremos y, si todo está bien, la publicaremos para que otras clientas puedan verla. 💚
              </p>
              <Link
                href="/"
                className="bg-[#154734] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#154734]/90 transition"
              >
                Volver a la tienda
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
