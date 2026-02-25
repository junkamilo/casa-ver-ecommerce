import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CreditCard, Sparkles } from "lucide-react";

import productAddi from "@/assets/product-1.jpg";
import productSiste from "@/assets/product-4.jpg";

const BRAND_GREEN = "#154734";
const BRAND_GOLD  = "#C19A6B";

const PaymentMethodsBanner = () => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#C19A6B]/10">
      <div className="max-w-7xl mx-auto">
        
        {/* ── HEADER EDITORIAL ── */}
        <div className="flex flex-col items-center justify-center mb-16 text-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8" style={{ background: BRAND_GOLD }} />
            <span className="text-[10px] font-black tracking-[0.38em] uppercase text-[#C19A6B]">
              Beneficios Casa Verde
            </span>
            <span className="h-px w-8" style={{ background: BRAND_GOLD }} />
          </div>
          <h2 className="text-4xl sm:text-5xl font-light text-[#154734] leading-none" style={{ fontFamily: "Georgia, serif" }}>
            Facilidades de <span className="italic" style={{ color: BRAND_GOLD }}>Pago</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          {/* ================= BANNER ADDI ================= */}
          <div className="group flex flex-col-reverse md:flex-row bg-[#FAFAFA] border border-gray-100 hover:shadow-[0_20px_40px_-15px_rgba(21,71,52,0.12)] transition-shadow duration-500 overflow-hidden">
            
            {/* Contenido de Texto */}
            <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative z-10 bg-[#FAFAFA]">
              
              {/* Etiqueta Minimalista de la Marca */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-white border border-blue-600/20 shadow-sm px-4 py-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-black text-blue-600 tracking-wider lowercase text-sm">addi</span>
                </div>
              </div>

              {/* Titular Mixto */}
              <h3 className="text-3xl lg:text-4xl text-[#154734] leading-[1.1] mb-5">
                <span className="block font-bold tracking-[0.05em] uppercase mb-1">Compra Ahora,</span>
                <span className="block italic" style={{ fontFamily: "Georgia, serif", color: BRAND_GOLD }}>Paga Después.</span>
              </h3>
              
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Llévate tus favoritos hoy y paga en cuotas sin interés. Aprobación en minutos solo con tu cédula y WhatsApp.
              </p>

              {/* Botón de Acción Sutil */}
              <Link
                href="#"
                className="group/btn inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#154734] hover:text-[#C19A6B] transition-colors mt-auto"
              >
                Pagar con Addi
                <span className="relative flex items-center justify-center w-8 h-8 rounded-full border border-[#154734]/20 group-hover/btn:border-[#C19A6B] transition-colors">
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </span>
              </Link>
            </div>

            {/* Imagen con Marco (Passepartout) */}
            <div className="w-full md:w-1/2 h-64 md:h-auto relative p-2 md:pl-0">
              <div className="relative w-full h-full overflow-hidden bg-white">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 z-10 pointer-events-none" />
                <Image
                  src={productAddi}
                  alt="Paga con Addi"
                  fill
                  className="object-cover object-top group-hover:scale-110 transition-transform duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
                />
              </div>
            </div>
          </div>

          {/* ================= BANNER SISTECRÉDITO ================= */}
          <div className="group flex flex-col-reverse md:flex-row bg-[#FAFAFA] border border-gray-100 hover:shadow-[0_20px_40px_-15px_rgba(21,71,52,0.12)] transition-shadow duration-500 overflow-hidden">
            
            {/* Contenido de Texto */}
            <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative z-10 bg-[#FAFAFA]">
              
              {/* Etiqueta Minimalista de la Marca */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-white border border-green-600/20 shadow-sm px-3 py-1.5">
                  <CreditCard className="w-4 h-4 text-green-700" strokeWidth={2} />
                  <span className="font-bold text-green-700 tracking-wider text-[11px] uppercase">Sistecrédito</span>
                </div>
              </div>

              {/* Titular Mixto */}
              <h3 className="text-3xl lg:text-4xl text-[#154734] leading-[1.1] mb-5">
                <span className="block font-bold tracking-[0.05em] uppercase mb-1">Crédito Fácil,</span>
                <span className="block italic" style={{ fontFamily: "Georgia, serif", color: BRAND_GOLD }}>Rápido y Seguro.</span>
              </h3>
              
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Utiliza tu cupo disponible. Elige las cuotas que mejor se adapten a ti sin necesidad de tarjetas de crédito.
              </p>

              {/* Botón de Acción Sutil */}
              <Link
                href="#"
                className="group/btn inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#154734] hover:text-[#C19A6B] transition-colors mt-auto"
              >
                Usar Sistecrédito
                <span className="relative flex items-center justify-center w-8 h-8 rounded-full border border-[#154734]/20 group-hover/btn:border-[#C19A6B] transition-colors">
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </span>
              </Link>
            </div>

            {/* Imagen con Marco (Passepartout) */}
            <div className="w-full md:w-1/2 h-64 md:h-auto relative p-2 md:pl-0">
              <div className="relative w-full h-full overflow-hidden bg-white">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 z-10 pointer-events-none" />
                <Image
                  src={productSiste}
                  alt="Paga con Sistecrédito"
                  fill
                  className="object-cover object-top group-hover:scale-110 transition-transform duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PaymentMethodsBanner;
