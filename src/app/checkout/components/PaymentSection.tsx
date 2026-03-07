"use client";

import { Lock } from "lucide-react";

const PaymentSection = () => {
  return (
    <section className="mb-10 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group/section hover:border-[#C19A6B]/30 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#154734] scale-y-0 group-hover/section:scale-y-100 origin-top transition-transform duration-500" />

      <div className="flex justify-between items-end mb-6">
        <h2
          className="text-xl sm:text-2xl text-[#154734] flex items-center gap-3"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Pago
        </h2>
        <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-bold">
          <Lock className="w-3 h-3 text-[#154734]" /> Todas las transacciones son seguras y están encriptadas.
        </span>
      </div>

      {/* Única opción: Mercado Pago */}
      <div className="border-2 border-[#154734] rounded-xl bg-[#154734]/5 p-5">
        <div className="flex items-center gap-4">
          {/* Radio seleccionado */}
          <div className="shrink-0 w-5 h-5 rounded-full border-2 border-[#154734] flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-[#154734] rounded-full" />
          </div>

          {/* Label + badges de métodos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-bold tracking-wide text-[#154734]">Mercado Pago</span>
              {/* Badges de métodos aceptados */}
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#009EE3]/10 border border-[#009EE3]/30 text-[#009EE3] font-bold">PSE</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FFCD00]/20 border border-[#FFCD00]/40 text-[#8B6914] font-bold">Bancolombia</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#1A1F71] text-white italic">VISA</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-bold">+2</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Se te redirigirá a Mercado Pago para que completes la compra.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentSection;
