"use client";

import { useFormContext } from "react-hook-form";
import { Lock } from "lucide-react";
import { SECTION_CLS, ACCENT_BAR_CLS } from "../constants";
import type { CheckoutFormData } from "../types/schema";
import { PseIcon, VisaIcon, MastercardIcon, AddiIcon } from "./icons/PaymentIcons";

const PaymentSection = () => {
  const { watch, setValue } = useFormContext<CheckoutFormData>();
  const paymentMethod = watch("paymentMethod");

  return (
    <section className={SECTION_CLS}>
      <div className={ACCENT_BAR_CLS} />

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

      <div className="flex flex-col gap-3">
        {/* ── Opción Bold ── */}
        <button
          type="button"
          onClick={() => setValue("paymentMethod", "BOLD", { shouldValidate: true })}
          className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-left ${
            paymentMethod === "BOLD"
              ? "border-[#154734] bg-[#154734]/5"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Radio visual */}
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-200 ${
                paymentMethod === "BOLD"
                  ? "border-[#154734] bg-[#154734]"
                  : "border-gray-300 bg-white"
              }`}
            >
              {paymentMethod === "BOLD" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <span className={`text-sm font-bold transition-colors duration-200 ${paymentMethod === "BOLD" ? "text-[#154734]" : "text-gray-600"}`}>
              Bold
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <PseIcon />
            <MastercardIcon />
            <VisaIcon />
            <span className="text-xs font-bold text-gray-500 ml-0.5">+2</span>
          </div>
        </button>

        {/* ── Opción Addi ── */}
        <button
          type="button"
          onClick={() => setValue("paymentMethod", "ADDI", { shouldValidate: true })}
          className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-left ${
            paymentMethod === "ADDI"
              ? "border-[#00C2A8] bg-[#00C2A8]/5"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Radio visual */}
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-200 ${
                paymentMethod === "ADDI"
                  ? "border-[#00C2A8] bg-[#00C2A8]"
                  : "border-gray-300 bg-white"
              }`}
            >
              {paymentMethod === "ADDI" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold transition-colors duration-200 ${paymentMethod === "ADDI" ? "text-[#00C2A8]" : "text-gray-600"}`}>
                Paga en cuotas con Addi
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Sin tarjeta de crédito</span>
            </div>
          </div>
          <AddiIcon />
        </button>
      </div>

      {/* Texto informativo según método seleccionado */}
      <p className="text-xs text-gray-500 text-center mt-4">
        {paymentMethod === "ADDI"
          ? "Serás redirigido al sitio de Addi para solicitar tu crédito."
          : "Se te redirigirá a Bold para que completes la compra."}
      </p>
    </section>
  );
};

export default PaymentSection;
