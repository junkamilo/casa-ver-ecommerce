"use client";

import { MapPin } from "lucide-react";
import { DeliveryFormFields } from "./DeliveryFormFields";

/** Sección de entrega para usuarios NO autenticados (guest checkout). */
const DeliverySection = () => {
  return (
    <section className="mb-8 sm:mb-10 bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-4xl border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] relative group/section hover:border-[#C19A6B]/30 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl sm:rounded-l-4xl bg-[#154734] scale-y-0 group-hover/section:scale-y-100 origin-top transition-transform duration-500" />
      <h2
        className="text-lg sm:text-xl md:text-2xl text-[#154734] mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3"
        style={{ fontFamily: "Georgia, serif" }}
      >
        <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-[#C19A6B] shrink-0" />
        Dirección de entrega
      </h2>
      <p className="-mt-3 mb-4 text-[11px] sm:text-xs text-amber-700">
        Envíos a zonas de difícil acceso pueden tener costo adicional
      </p>
      <DeliveryFormFields />
    </section>
  );
};

export default DeliverySection;
