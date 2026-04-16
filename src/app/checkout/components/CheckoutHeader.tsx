"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Truck } from "lucide-react";

const CheckoutHeader = () => {
  return (
  <>
    <header className="mb-10 flex items-center gap-4 sm:gap-6 relative z-10">
      <Link
        href="/"
        className="flex shrink-0 items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-200 bg-white hover:border-[#C19A6B] hover:shadow-md transition-all duration-300 group"
        aria-label="Volver al inicio"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-[#154734] transition-colors" />
      </Link>
      <Link
        href="/"
        className="text-3xl sm:text-5xl text-[#154734] tracking-tight leading-none flex items-center gap-2 group"
        style={{ fontFamily: "Georgia, serif" }}
      >
        CASA{" "}
        <span className="italic text-[#C19A6B] group-hover:text-[#154734] transition-colors duration-500">
          VERDE
        </span>
      </Link>
    </header>


<div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-x-8 mb-10 bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-gray-100 shadow-sm relative z-10">
      <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs font-bold text-[#154734] uppercase tracking-widest">
        <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C19A6B] shrink-0" />
        <span>Pago 100% Seguro</span>
      </div>
      <div className="w-px h-4 bg-[#C19A6B]/30 sm:hidden" />
      <div className="hidden sm:block w-1 h-1 rounded-full bg-[#C19A6B]/50" />
      <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs font-bold text-[#154734] uppercase tracking-widest">
        <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C19A6B] shrink-0" />
        <span>Envío a todo Colombia</span>
      </div>
    </div>
  </>
  );
};

export default CheckoutHeader;
