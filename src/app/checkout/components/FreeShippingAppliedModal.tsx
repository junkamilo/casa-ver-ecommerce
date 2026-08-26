"use client";

import { useEffect } from "react";
import { Sparkles, Truck } from "lucide-react";
import { LOCALE } from "../constants";

interface FreeShippingAppliedModalProps {
  open: boolean;
  onClose: () => void;
  /** Tarifa geográfica evitada; null si aún no hay dirección. */
  shippingSavings: number | null;
  /** Umbral de envío gratis desde ShippingConfig (COP). */
  threshold: number;
}

const BALLOON_COLORS = ["#154734", "#C19A6B", "#FAFAFA", "#2d6a4f", "#d4a574"];

function FloatingBalloon({ color, left, delay, size }: { color: string; left: string; delay: string; size: number }) {
  return (
    <div
      className="absolute bottom-0 pointer-events-none opacity-60"
      style={{
        left,
        animation: `floatUp 4s ease-in-out ${delay} infinite`,
      }}
    >
      <div
        className="rounded-full shadow-sm"
        style={{
          width: size,
          height: size * 1.2,
          backgroundColor: color,
          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
        }}
      />
      <div className="mx-auto w-px bg-gray-300/50" style={{ height: size * 0.8 }} />
    </div>
  );
}

export default function FreeShippingAppliedModal({
  open,
  onClose,
  shippingSavings,
  threshold,
}: FreeShippingAppliedModalProps) {
  const formattedThreshold = threshold.toLocaleString(LOCALE);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const runConfetti = async () => {
      const confetti = (await import("canvas-confetti")).default;
      if (cancelled) return;

      const brandColors = ["#154734", "#C19A6B", "#FAFAFA", "#2d6a4f"];

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6, x: 0.5 },
        colors: brandColors,
        zIndex: 70,
      });

      setTimeout(() => {
        if (cancelled) return;
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
          colors: brandColors,
          zIndex: 70,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
          colors: brandColors,
          zIndex: 70,
        });
      }, 300);
    };

    void runConfetti();

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        style={{ animation: "fadeIn 0.2s ease-out, scaleIn 0.2s ease-out" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {BALLOON_COLORS.map((color, i) => (
            <FloatingBalloon
              key={color}
              color={color}
              left={`${12 + i * 16}%`}
              delay={`${i * 0.4}s`}
              size={20 + (i % 3) * 6}
            />
          ))}
        </div>

        <div className="relative bg-[#154734] px-7 pt-8 pb-7 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#C19A6B]/20 flex items-center justify-center mb-4">
            <Truck className="w-8 h-8 text-[#C19A6B]" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#C19A6B]" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C19A6B]">
              ¡Logro desbloqueado!
            </span>
            <Sparkles className="w-4 h-4 text-[#C19A6B]" />
          </div>
          <h2
            className="text-2xl font-bold text-white leading-snug"
            style={{ fontFamily: "Georgia, serif" }}
          >
            ¡Envío gratis!
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Tu compra supera los{" "}
            <span className="font-bold text-[#C19A6B]">${formattedThreshold}</span> después de descuentos
          </p>
        </div>

        <div className="relative p-7 text-center space-y-5">
          <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/70 mb-1">
              {shippingSavings != null && shippingSavings > 0
                ? "Ahorras en envío"
                : "Beneficio activo"}
            </p>
            {shippingSavings != null && shippingSavings > 0 ? (
              <p
                className="text-3xl font-light text-[#154734] tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                ${shippingSavings.toLocaleString(LOCALE)}
              </p>
            ) : (
              <p className="text-lg font-bold text-[#154734]">Sin costo de envío</p>
            )}
          </div>

          <p className="text-sm text-gray-500">
            El envío gratis ya está aplicado en tu resumen. ¡Disfruta tu compra en Casa Verde!
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-[#154734] text-white text-sm font-black uppercase tracking-[0.15em] hover:bg-[#103a2a] active:scale-[0.98] transition-all"
          >
            Continuar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 }               to { opacity: 1 } }
        @keyframes scaleIn { from { transform: scale(0.95) }   to { transform: scale(1) } }
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(-5deg); opacity: 0.7; }
          50%  { transform: translateY(-120px) rotate(5deg); opacity: 0.5; }
          100% { transform: translateY(-240px) rotate(-3deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
