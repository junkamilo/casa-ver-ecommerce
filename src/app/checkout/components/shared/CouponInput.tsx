"use client";

import { useState } from "react";
import { Tag, X, Loader2, CheckCircle2 } from "lucide-react";
import type { CouponState } from "../../types";

interface CouponInputProps {
  coupon: CouponState;
  onApply: (code: string) => Promise<void>;
  onRemove: () => void;
  /** compact=true → tamaños reducidos para el panel mobile */
  compact?: boolean;
}

/**
 * Campo de cupón reutilizable para el panel desktop y el drawer mobile.
 * compact=false → desktop (padding generoso, botón outline)
 * compact=true  → mobile (padding ajustado, botón sólido verde)
 */
export default function CouponInput({
  coupon,
  onApply,
  onRemove,
  compact = false,
}: CouponInputProps) {
  const [inputCode, setInputCode] = useState("");

  async function handleApply() {
    if (!inputCode.trim()) return;
    await onApply(inputCode.trim());
  }

  // ── Estado válido ──────────────────────────────────────────────────────────
  if (coupon.status === "valid") {
    return (
      <div
        className={`flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl ${
          compact ? "px-4 py-3" : "px-5 py-3.5"
        }`}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <div>
            <p
              className={`font-bold text-green-700 uppercase tracking-widest ${
                compact ? "text-xs" : "text-sm"
              }`}
            >
              {coupon.code}
            </p>
            <p className={`text-green-600 ${compact ? "text-[10px]" : "text-xs"}`}>
              {coupon.discountPercentage}% de descuento aplicado
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // ── Estado idle / invalid / validating ────────────────────────────────────
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#154734] flex items-center gap-2">
        <Tag className="w-3 h-3 text-[#C19A6B]" />
        ¿Tienes un código de descuento?
      </label>

      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 focus-within:border-[#C19A6B] focus-within:ring-4 focus-within:ring-[#C19A6B]/15 transition-all duration-300 shadow-sm">
        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApply())}
          placeholder="Ingresa tu cupón"
          className={`flex-1 bg-transparent outline-none placeholder:text-gray-400 font-bold text-[#154734] uppercase tracking-widest ${
            compact ? "px-4 py-2.5 text-xs" : "px-5 py-3.5 text-sm"
          }`}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={coupon.status === "validating"}
          className={`text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-60 flex items-center gap-2 ${
            compact
              ? "bg-[#154734] text-white px-5"
              : "bg-[#FAFAFA] text-[#154734] border border-gray-200 hover:bg-[#154734] hover:text-white hover:border-[#154734] px-8"
          }`}
        >
          {coupon.status === "validating" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            "Aplicar"
          )}
        </button>
      </div>

      {coupon.status === "invalid" && (
        <p className={`font-medium ml-1 text-red-500 ${compact ? "text-[10px]" : "text-xs"}`}>
          {coupon.errorMessage}
        </p>
      )}
    </div>
  );
}
