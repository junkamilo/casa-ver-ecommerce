"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, UserPlus, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import type { PromotionStatus } from "@/app/actions/promotions";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface GuestCheckoutModalProps {
  /** Callback cuando el usuario elige "Continuar como invitado" */
  onContinueAsGuest: () => void;
}

// ---------------------------------------------------------------------------
// GuestCheckoutModal
// Pantalla intermedia que aparece cuando un usuario NO autenticado
// intenta acceder al checkout. Le presenta dos opciones:
//   A) Registrarse (con incentivo de promoción si hay cupos)
//   B) Continuar como invitado (flujo rápido, sin descuento)
// ---------------------------------------------------------------------------
export default function GuestCheckoutModal({ onContinueAsGuest }: GuestCheckoutModalProps) {
  const router = useRouter();
  const [promotion, setPromotion] = useState<PromotionStatus | null>(null);
  const [loadingPromo, setLoadingPromo] = useState(true);

  // Cargar estado de la promoción activa al montar
  useEffect(() => {
    fetch("/api/promotions/status")
      .then((r) => r.json())
      .then((data: PromotionStatus & { isAvailable?: boolean }) => {
        if (data?.id) setPromotion(data);
      })
      .catch(() => {
        // Silencioso: si falla, simplemente no mostramos el incentivo
      })
      .finally(() => setLoadingPromo(false));
  }, []);

  const handleRegister = () => {
    // Pasamos returnTo=/checkout para que tras el registro vuelvan directo al pago
    router.push("/registro?returnTo=/checkout");
  };

  // Etiqueta de cupo: "Sé el usuario 4 de 10" (posición que tomaría el nuevo usuario)
  const nextSlot = promotion ? promotion.currentUses + 1 : null;
  const hasPromo = promotion?.isAvailable === true;

  return (
    // Fondo oscuro con blur — previene interacción con el form detrás
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        // Animación de entrada nativa de Tailwind (disponible en v4)
        style={{ animation: "fadeIn 0.2s ease-out, scaleIn 0.2s ease-out" }}
      >
        {/* ── Header verde ─────────────────────────────────────────────── */}
        <div className="bg-[#154734] px-7 pt-7 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="w-4 h-4 text-[#C19A6B]" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C19A6B]">
              Casa Verde
            </span>
          </div>
          <h2
            className="text-2xl font-bold text-white leading-snug"
            style={{ fontFamily: "Georgia, serif" }}
          >
            ¿Cómo deseas continuar?
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Elige la opción que prefieras para completar tu compra.
          </p>
        </div>

        {/* ── Opciones ─────────────────────────────────────────────────── */}
        <div className="p-6 space-y-3">

          {/* ── Skeleton mientras carga la promo ──────────────────────── */}
          {loadingPromo && (
            <div className="w-full border-2 border-amber-200 bg-amber-50 rounded-2xl p-5 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
              <span className="text-sm text-amber-600">Verificando oferta disponible…</span>
            </div>
          )}

          {/* ── Opción A: Registrarse CON incentivo ───────────────────── */}
          {!loadingPromo && hasPromo && promotion && (
            <button
              onClick={handleRegister}
              className="w-full text-left border-2 border-amber-400 bg-amber-50 rounded-2xl p-5 hover:bg-amber-100 transition-colors group active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {/* Badge */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                      Oferta limitada
                    </span>
                  </div>

                  {/* Título */}
                  <p className="font-bold text-gray-900 text-[15px] leading-snug">
                    Regístrate y obtén{" "}
                    <span className="text-[#154734]">
                      {promotion.discountPercentage}% de descuento
                    </span>
                  </p>

                  {/* Contador de cupos */}
                  <p className="mt-1 text-sm text-amber-700 font-medium">
                    Sé el usuario{" "}
                    <span className="font-black">{nextSlot}</span> de{" "}
                    <span className="font-black">{promotion.maxUses}</span>
                    {" · "}
                    {promotion.slotsRemaining === 1 ? (
                      <span className="text-red-600 font-black">¡Último cupo!</span>
                    ) : (
                      <>
                        Solo{" "}
                        <span className="font-black">{promotion.slotsRemaining}</span> cupos
                      </>
                    )}
                  </p>
                </div>

                {/* Ícono acción */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
              </div>
            </button>
          )}

          {/* ── Opción A: Registrarse SIN incentivo (sin cupos o sin promo) ── */}
          {!loadingPromo && !hasPromo && (
            <button
              onClick={handleRegister}
              className="w-full text-left border-2 border-[#154734]/20 bg-[#154734]/5 rounded-2xl p-5 hover:bg-[#154734]/10 transition-colors group active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900 text-[15px]">Crear una cuenta</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Guarda tu historial de pedidos y dirección de envío
                  </p>
                </div>
                <div className="shrink-0 w-10 h-10 rounded-full bg-[#154734] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
              </div>
            </button>
          )}

          {/* ── Opción B: Continuar como invitado ─────────────────────── */}
          <button
            onClick={onContinueAsGuest}
            className="w-full text-left border border-gray-200 rounded-2xl p-5 hover:bg-gray-50 transition-colors group active:scale-[0.98]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-gray-900 text-[15px]">Continuar como invitado</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Sin cuenta · Pago rápido
                </p>
              </div>
              <div className="shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </button>

          {/* ── Enlace a login ─────────────────────────────────────────── */}
          <p className="text-center text-xs text-gray-400 pt-1">
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={() => router.push("/login?returnTo=/checkout")}
              className="font-semibold text-[#154734] hover:text-[#C19A6B] transition-colors"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </div>

      {/* ── Animaciones CSS inline (compatibles con cualquier versión de Tailwind) ── */}
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 }               to { opacity: 1 } }
        @keyframes scaleIn { from { transform: scale(0.95) }   to { transform: scale(1) } }
      `}</style>
    </div>
  );
}
