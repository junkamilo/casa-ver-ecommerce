"use client";

import Image from "next/image";
import { Sparkles, Tag, X, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { LOCALE } from "../constants/constants";
import type { CheckoutItem, CouponState } from "../types/types";

interface OrderSummaryPanelProps {
  items: CheckoutItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon: CouponState;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => void;
}

const OrderSummaryPanel = ({
  items,
  subtotal,
  discount,
  total,
  coupon,
  onApplyCoupon,
  onRemoveCoupon,
}: OrderSummaryPanelProps) => {
  const [inputCode, setInputCode] = useState("");

  async function handleApply() {
    if (!inputCode.trim()) return;
    await onApplyCoupon(inputCode.trim());
  }

  return (
    <div className="hidden lg:flex lg:w-[45%] bg-[#154734] px-8 xl:px-16 pt-16 pb-20 justify-center relative overflow-hidden isolate shadow-2xl">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "radial-gradient(#C19A6B 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#C19A6B] opacity-10 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3" />

      <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.3)] h-fit sticky top-16 overflow-hidden isolate border border-white/10">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C19A6B]/50 via-[#C19A6B] to-[#C19A6B]/50" />

        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center justify-center gap-3 border-b border-gray-100 pb-5">
          <Sparkles className="w-4 h-4 text-[#C19A6B]" />
          Tu Selección Casa Verde
        </h3>

        {/* Productos */}
        <div className="space-y-6 mb-10 max-h-[45vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-5 items-center group/item bg-[#FAFAFA] p-3 rounded-2xl border border-transparent hover:border-[#C19A6B]/30 hover:bg-white transition-all duration-300">
              <div className="relative w-[80px] h-[96px] rounded-xl overflow-hidden shrink-0 shadow-sm group-hover/item:shadow-md transition-shadow">
                <Image src={item.image} alt={item.name} fill className="object-cover group-hover/item:scale-110 transition-transform duration-700" />
                <div className="absolute top-0 right-0 bg-[#154734] text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-bl-xl z-10 shadow-sm">
                  {item.quantity}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#154734] uppercase tracking-wide truncate group-hover/item:text-[#C19A6B] transition-colors">
                  {item.name}
                </p>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1">{item.color} · {item.size}</p>
              </div>
              <span className="text-sm font-bold text-[#154734]">
                ${(item.price * item.quantity).toLocaleString(LOCALE)}
              </span>
            </div>
          ))}
        </div>

        {/* Cupón */}
        <div className="flex flex-col gap-3 mb-10">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#154734] ml-2 flex items-center gap-2">
            <Tag className="w-3 h-3 text-[#C19A6B]" />
            ¿Tienes un código de descuento?
          </label>

          {coupon.status === "valid" ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-5 py-3.5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-700 uppercase tracking-widest">{coupon.code}</p>
                  <p className="text-xs text-green-600">{coupon.discountPercentage}% de descuento aplicado</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRemoveCoupon}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 focus-within:border-[#C19A6B] focus-within:ring-4 focus-within:ring-[#C19A6B]/15 transition-all duration-300 shadow-sm">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApply())}
                  placeholder="Ingresa tu cupón"
                  className="flex-1 px-5 py-3.5 bg-transparent outline-none text-sm placeholder:text-gray-400 font-bold text-[#154734] uppercase tracking-widest"
                />
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={coupon.status === "validating"}
                  className="bg-[#FAFAFA] text-[#154734] border border-gray-200 hover:bg-[#154734] hover:text-white hover:border-[#154734] text-xs font-bold uppercase tracking-widest px-8 rounded-xl transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-60 flex items-center gap-2"
                >
                  {coupon.status === "validating" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Aplicar"}
                </button>
              </div>
              {coupon.status === "invalid" && (
                <p className="text-xs text-red-500 font-medium ml-2">{coupon.errorMessage}</p>
              )}
            </>
          )}
        </div>

        {/* Totales */}
        <div className="space-y-4 text-sm text-gray-500 font-medium mb-8 px-2">
          <div className="flex justify-between items-center">
            <span>Subtotal</span>
            <span className="text-[#154734] font-bold">${subtotal.toLocaleString(LOCALE)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span>Descuento cupón</span>
              <span className="font-bold">-${discount.toLocaleString(LOCALE)}</span>
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-gray-100 flex justify-between items-end bg-[#FAFAFA] -mx-10 px-10 pb-4 rounded-b-[2.5rem]">
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 mb-2">
            Total a pagar
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-[#C19A6B] font-bold">COP</span>
            <span
              className="text-4xl lg:text-5xl font-light text-[#154734] tracking-tighter drop-shadow-sm"
              style={{ fontFamily: "Georgia, serif" }}
            >
              ${total.toLocaleString(LOCALE)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPanel;
