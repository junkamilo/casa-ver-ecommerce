import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CreditCard } from "lucide-react";

import productAddi from "@/assets/product-1.jpg";
import productSiste from "@/assets/product-4.jpg";

const PaymentMethodsBanner = () => {
  return (
    <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-350 mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-10 uppercase tracking-wider title-accent-center">
          Facilidades de Pago
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">

          {/* ================= BANNER ADDI ================= */}
          <div className="relative min-h-0 md:h-125 group overflow-hidden flex flex-col-reverse md:flex-row bg-surface-light border-l-4 border-accent shadow-premium hover:shadow-premium-hover transition-shadow">
            <div className="w-full md:w-1/2 p-5 sm:p-8 lg:p-12 flex flex-col justify-center relative z-10">
              <div className="mb-6">
                <div className="h-10 w-28 bg-blue-600/20 flex items-center justify-center border-2 border-blue-600 rounded px-2">
                  <span className="font-bold text-blue-600 tracking-tighter">addi</span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold uppercase leading-none mb-3 sm:mb-4">
                Compra ahora,<br />paga después.
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-8 leading-relaxed font-medium">
                Llévate tus favoritos hoy y paga en cuotas sin interés. Aprobación en minutos solo con tu cédula y WhatsApp.
              </p>

              <Link
                href="#"
                className="group/btn inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors"
              >
                Clic aquí para pagar con Addi
                <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-2" />
              </Link>
            </div>

            <div className="relative w-full md:w-1/2 h-48 sm:h-75 md:h-full overflow-hidden">
               <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />
               <Image
                 src={productAddi}
                 alt="Paga con Addi"
                 fill
                 className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-in-out"
               />
            </div>
          </div>

          {/* ================= BANNER SISTECRÉDITO ================= */}
          <div className="relative min-h-0 md:h-125 group overflow-hidden flex flex-col-reverse md:flex-row bg-secondary border-l-4 border-accent shadow-premium hover:shadow-premium-hover transition-shadow">
            <div className="w-full md:w-1/2 p-5 sm:p-8 lg:p-12 flex flex-col justify-center relative z-10">
              <div className="mb-6">
                 <div className="h-10 w-36 bg-green-600/20 flex items-center justify-center border-2 border-green-600 rounded px-2 gap-2">
                  <CreditCard className="w-5 h-5 text-green-700" />
                  <span className="font-bold text-green-700 text-sm">Sistecrédito</span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold uppercase leading-none mb-3 sm:mb-4">
                Crédito fácil,<br />rápido y seguro.
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-8 leading-relaxed font-medium">
                Utiliza tu cupo disponible de Sistecrédito. Elige las cuotas que mejor se adapten a ti sin tarjetas de crédito.
              </p>

              <Link
                href="#"
                className="group/btn inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors"
              >
                Clic aquí para usar Sistecrédito
                <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-2" />
              </Link>
            </div>

             <div className="relative w-full md:w-1/2 h-48 sm:h-75 md:h-full overflow-hidden">
               <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />
               <Image
                 src={productSiste}
                 alt="Paga con Sistecrédito"
                 fill
                 className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-in-out"
               />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PaymentMethodsBanner;
