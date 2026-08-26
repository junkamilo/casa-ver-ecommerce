"use client";

import PriceInput from "@/app/admin/productos/components/shared/PriceInput";
import type { ShippingRateFieldProps } from "../types";

export default function ShippingRateField({
  label,
  subtitle,
  accentClass,
  value,
  onChange,
  id,
}: ShippingRateFieldProps) {
  return (
    <div className={`rounded-2xl border p-5 sm:p-6 ${accentClass}`}>
      <label htmlFor={id} className="block text-sm font-bold mb-1">
        {label}
      </label>
      {subtitle && <p className="text-xs opacity-80 mb-4 leading-relaxed">{subtitle}</p>}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold opacity-60">
          $
        </span>
        <PriceInput
          value={value}
          onChange={onChange}
          className="w-full pl-8 pr-4 py-3.5 bg-white/80 border border-black/10 rounded-xl text-lg font-bold text-[#154734] focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/30"
        />
      </div>
      <p className="text-[10px] mt-2 opacity-70 uppercase tracking-wider font-semibold">
        COP · pesos colombianos
      </p>
    </div>
  );
}
