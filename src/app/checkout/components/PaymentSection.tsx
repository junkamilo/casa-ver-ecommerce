"use client";

import { Lock } from "lucide-react";

const PaymentSection = () => {
  return (
    <section className="mb-8 sm:mb-10 bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-4xl border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group/section hover:border-[#C19A6B]/30 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#154734] scale-y-0 group-hover/section:scale-y-100 origin-top transition-transform duration-500" />

      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
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

      {/* Bold — único método de pago */}
      <div className="flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border-2 border-[#154734] bg-[#154734]/5">
        <div className="w-4 h-4 rounded-full border-2 border-[#154734] bg-[#154734] flex items-center justify-center shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
        <span className="text-sm font-bold text-[#154734]">Bold</span>
      </div>

      <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 text-center">
        Se te redirigirá a Bold para que completes la compra.
      </p>
    </section>
  );
};

export default PaymentSection;
