"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, X } from "lucide-react";
import type { ActivePromoPopupDTO } from "@/modules/adminCatalog/promoPopups/contracts/promo-popup.dto";

interface PromoPopupModalProps {
  popup: ActivePromoPopupDTO;
  onClose: () => void;
}

export default function PromoPopupModal({ popup, onClose }: PromoPopupModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(popup.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard no disponible
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        style={{ animation: "fadeIn 0.2s ease-out, scaleIn 0.2s ease-out" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-popup-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-8 pt-10 pb-6 text-center">
          <h2
            id="promo-popup-title"
            className="text-4xl sm:text-5xl font-bold text-[#154734] leading-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {popup.headline}
          </h2>
          <p
            className="mt-2 text-xl sm:text-2xl text-[#154734]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {popup.subtitle}
          </p>
          <div className="border-t border-gray-200 mt-6 mb-5" />
          <p className="text-sm text-gray-500 mb-3">Usa el código:</p>
          <div className="flex items-center justify-center gap-2 bg-[#154734] text-white rounded-lg px-5 py-4 mx-auto max-w-xs">
            <span className="font-mono font-bold tracking-widest text-sm sm:text-base">
              {popup.couponCode}
            </span>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              title="Copiar código"
              aria-label="Copiar código"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied ? (
            <p className="text-xs text-emerald-600 font-medium mt-2">Código copiado</p>
          ) : (
            <div className="h-5 mt-2" aria-hidden />
          )}
          <p className="text-xs text-gray-400 mt-4 mb-6">{popup.disclaimer}</p>
          <Link
            href={popup.ctaUrl}
            onClick={onClose}
            className="block w-full bg-[#154734] text-white text-sm font-black uppercase tracking-[0.15em] py-4 rounded-lg hover:bg-[#103a2a] active:scale-[0.99] transition-all text-center"
          >
            {popup.ctaText}
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { transform: scale(0.95) } to { transform: scale(1) } }
      `}</style>
    </div>
  );
}
