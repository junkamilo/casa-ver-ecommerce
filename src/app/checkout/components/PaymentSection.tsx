"use client";

import { Lock } from "lucide-react";

const PaymentSection = () => {
  return (
    <section className="mb-10 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group/section hover:border-[#C19A6B]/30 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#154734] scale-y-0 group-hover/section:scale-y-100 origin-top transition-transform duration-500" />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-0 mb-6">
        <h2
          className="text-xl sm:text-2xl text-[#154734] flex items-center gap-3"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Pago
        </h2>
        <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-bold">
          <Lock className="w-3 h-3 text-[#154734] shrink-0" /> Todas las
          transacciones son seguras y están encriptadas.
        </span>
      </div>

      {/* Bold — único método de pago */}
      <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#154734] bg-[#154734]/5">
        <div className="w-4 h-4 rounded-full border-2 border-[#154734] bg-[#154734] flex items-center justify-center shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-[#154734]">Bold</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500 text-center">
        Se te redirigirá a Bold para que completes la compra.
      </p>
    </section>
  );
};

export default PaymentSection;
