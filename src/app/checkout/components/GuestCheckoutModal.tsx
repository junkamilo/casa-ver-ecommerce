"use client";

import { useRouter } from "next/navigation";
import { UserPlus, ArrowRight, ShoppingBag } from "lucide-react";

interface GuestCheckoutModalProps {
  onContinueAsGuest: () => void;
}

export default function GuestCheckoutModal({ onContinueAsGuest }: GuestCheckoutModalProps) {
  const router = useRouter();

  const handleRegister = () => {
    router.push("/registro?returnTo=/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        style={{ animation: "fadeIn 0.2s ease-out, scaleIn 0.2s ease-out" }}
      >
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

        <div className="p-6 space-y-3">
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

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 }               to { opacity: 1 } }
        @keyframes scaleIn { from { transform: scale(0.95) }   to { transform: scale(1) } }
      `}</style>
    </div>
  );
}
