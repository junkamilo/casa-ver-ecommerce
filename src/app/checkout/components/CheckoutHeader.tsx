"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, ShieldCheck, Truck } from "lucide-react";

const CheckoutHeader = () => {
  const router = useRouter();

  return (
  <>
    <header className="mb-10 flex items-center gap-4 sm:gap-6 relative z-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex shrink-0 items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-200 bg-white hover:border-[#C19A6B] hover:shadow-md transition-all duration-300 group"
        aria-label="Volver"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-[#154734] transition-colors" />
      </button>
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

    <nav className="flex items-center text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400 mb-10 gap-3 ml-2 relative z-10">
      <Link href="/carrito" className="hover:text-[#C19A6B] transition-colors">
        Bolsa
      </Link>
      <ChevronRight className="w-3 h-3 text-[#C19A6B]/50" />
      <span className="text-[#154734] font-bold border-b border-[#C19A6B] pb-0.5">
        Información
      </span>
      <ChevronRight className="w-3 h-3 text-[#C19A6B]/50" />
      <span>Pago</span>
    </nav>

    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mb-10 bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm relative z-10">
      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-[#154734] uppercase tracking-widest">
        <ShieldCheck className="w-4 h-4 text-[#C19A6B]" />
        Pago 100% Seguro
      </div>
      <div className="hidden sm:block w-1 h-1 rounded-full bg-[#C19A6B]/50" />
      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-[#154734] uppercase tracking-widest">
        <Truck className="w-4 h-4 text-[#C19A6B]" />
        Envío a todo Colombia
      </div>
    </div>
  </>
  );
};

export default CheckoutHeader;
