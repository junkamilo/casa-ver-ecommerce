"use client";

import { Lock } from "lucide-react";

// Íconos SVG inline de métodos de pago que Bold soporta
const PseIcon = () => (
  <svg width="36" height="20" viewBox="0 0 36 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="20" rx="3" fill="#F5F5F5" />
    <text x="18" y="14" textAnchor="middle" fontSize="8" fontWeight="700" fill="#00A651" fontFamily="Arial">PSE</text>
  </svg>
);

const VisaIcon = () => (
  <svg width="36" height="20" viewBox="0 0 36 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="20" rx="3" fill="#1A1F71" />
    <text x="18" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="white" fontFamily="Arial">VISA</text>
  </svg>
);

const MastercardIcon = () => (
  <svg width="36" height="20" viewBox="0 0 36 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="20" rx="3" fill="#F5F5F5" />
    <circle cx="13" cy="10" r="6" fill="#EB001B" />
    <circle cx="23" cy="10" r="6" fill="#F79E1B" />
    <path d="M18 5.5a6 6 0 010 9 6 6 0 010-9z" fill="#FF5F00" />
  </svg>
);

const PaymentSection = () => {
  return (
    <section className="mb-8 sm:mb-10 bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-4xl border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group/section hover:border-[#C19A6B]/30 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#154734] scale-y-0 group-hover/section:scale-y-100 origin-top transition-transform duration-500" />

      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
        <h2
          className="text-lg sm:text-xl md:text-2xl text-[#154734] shrink-0"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Pago
        </h2>
        <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wide font-bold text-right">
          <Lock className="w-3 h-3 text-[#154734] shrink-0" />
          Todas las transacciones son seguras y están encriptadas.
        </span>
      </div>

      {/* Opción Bold */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border-2 border-[#154734] bg-[#154734]/5">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-[#154734] bg-[#154734] flex items-center justify-center shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <span className="text-sm font-bold text-[#154734]">Bold</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PseIcon />
          <MastercardIcon />
          <VisaIcon />
          <span className="text-xs font-bold text-gray-500 ml-0.5">+2</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Se te redirigirá a Bold para que completes la compra.
      </p>
    </section>
  );
};

export default PaymentSection;
