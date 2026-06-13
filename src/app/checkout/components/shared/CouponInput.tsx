"use client";

import { useState } from "react";
import Link from "next/link";
import { TicketPercent, Loader2, Check, X } from "lucide-react";
import type { CouponState } from "../../types";

interface CouponInputProps {
  coupon: CouponState;
  onApply: (code: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export default function CouponInput({
  coupon,
  onApply,
  onRemove,
  disabled = false,
}: CouponInputProps) {
  const [inputValue, setInputValue] = useState(coupon.code);

  const isValidating = coupon.status === "validating";
  const isValid = coupon.status === "valid";
  const isInvalid = coupon.status === "invalid";
  const isDisabled = disabled || isValidating || isValid;

  const handleApply = () => {
    const trimmed = inputValue.trim().toUpperCase();
    if (!trimmed) return;
    onApply(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isDisabled) handleApply();
    }
  };

  const needsRegistration = isInvalid && coupon.errorMessage?.includes("registrarte");

  if (isValid) {
    return (
      <div className="mb-6 px-1">
        <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/80">
                Cupón aplicado
              </p>
              <p className="text-sm font-bold text-[#154734] truncate">{coupon.code}</p>
            </div>
            <span className="shrink-0 text-[10px] font-black bg-[#154734] text-white px-2 py-0.5 rounded-full">
              {coupon.discountType === "FIXED" && coupon.discountValue
                ? `−$${coupon.discountValue.toLocaleString("es-CO")}`
                : `−${coupon.discountPercentage}%`}
            </span>
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            Quitar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 px-1">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-2.5 flex items-center gap-1.5">
        <TicketPercent className="w-3.5 h-3.5 text-[#C19A6B]" />
        Código de cupón
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="EJ: ABC123XYZ456"
          disabled={isDisabled}
          className={`flex-1 min-w-0 px-4 py-3 rounded-xl border text-sm font-bold uppercase tracking-wider text-[#154734] placeholder:text-gray-300 placeholder:font-medium placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
            isInvalid
              ? "border-red-300 bg-red-50/50"
              : "border-gray-200 bg-[#FAFAFA] focus:border-[#C19A6B]"
          }`}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? "coupon-error" : undefined}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={isDisabled || !inputValue.trim()}
          className="shrink-0 px-5 py-3 rounded-xl bg-[#154734] text-white text-[11px] font-black uppercase tracking-[0.15em] hover:bg-[#103a2a] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Validando</span>
            </>
          ) : (
            "Aplicar"
          )}
        </button>
      </div>

      {isInvalid && coupon.errorMessage && (
        <div id="coupon-error" className="mt-2.5 text-xs text-red-600 font-medium">
          <p>{coupon.errorMessage}</p>
          {needsRegistration && (
            <Link
              href="/registro?returnTo=/checkout"
              className="inline-block mt-1 font-bold text-[#154734] hover:text-[#C19A6B] underline underline-offset-2"
            >
              Crear cuenta para usar este cupón
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
