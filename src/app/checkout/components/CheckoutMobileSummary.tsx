"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  ChevronUp,
  X,
  Sparkles,
  Tag,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { LOCALE } from "../constants/constants";
import type { CheckoutItem, CouponState } from "../types/types";

interface CheckoutMobileSummaryProps {
  items: CheckoutItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon: CouponState;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => void;
}

export default function CheckoutMobileSummary({
  items,
  subtotal,
  discount,
  total,
  coupon,
  onApplyCoupon,
  onRemoveCoupon,
}: CheckoutMobileSummaryProps) {
  const [open, setOpen] = useState(false);
  const [inputCode, setInputCode] = useState("");

  async function handleApply() {
    if (!inputCode.trim()) return;
    await onApplyCoupon(inputCode.trim());
  }

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`lg:hidden fixed left-0 right-0 bottom-[64px] z-50 transition-transform duration-300 ease-in-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "75dvh" }}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl border-t border-gray-100 flex flex-col h-full">
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
            <h3
              className="text-xs font-black uppercase tracking-[0.25em] text-[#154734] flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C19A6B]" />
              Tu Selección Casa Verde
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors active:scale-90"
              aria-label="Cerrar resumen"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
            {/* Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 items-center bg-[#FAFAFA] p-3 rounded-2xl border border-gray-100"
                >
                  <div className="relative w-14 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute top-0 right-0 bg-[#154734] text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-bl-xl z-10">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#154734] uppercase tracking-wide truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                      {item.color} · {item.size}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#154734] shrink-0">
                    ${(item.price * item.quantity).toLocaleString(LOCALE)}
                  </span>
                </div>
              ))}
            </div>

            {/* Cupón */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#154734] flex items-center gap-2">
                <Tag className="w-3 h-3 text-[#C19A6B]" />
                ¿Tienes un código de descuento?
              </label>

              {coupon.status === "valid" ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-green-700 uppercase tracking-widest">
                        {coupon.code}
                      </p>
                      <p className="text-[10px] text-green-600">
                        {coupon.discountPercentage}% de descuento aplicado
                      </p>
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
                  <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 focus-within:border-[#C19A6B] focus-within:ring-4 focus-within:ring-[#C19A6B]/15 transition-all shadow-sm">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), handleApply())
                      }
                      placeholder="Ingresa tu cupón"
                      className="flex-1 px-4 py-2.5 bg-transparent outline-none text-xs placeholder:text-gray-400 font-bold text-[#154734] uppercase tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={handleApply}
                      disabled={coupon.status === "validating"}
                      className="bg-[#154734] text-white text-[10px] font-bold uppercase tracking-widest px-5 rounded-xl transition-all active:scale-95 disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {coupon.status === "validating" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Aplicar"
                      )}
                    </button>
                  </div>
                  {coupon.status === "invalid" && (
                    <p className="text-[10px] text-red-500 font-medium ml-1">
                      {coupon.errorMessage}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Totales */}
            <div className="space-y-2.5 text-sm text-gray-500 font-medium pt-1 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="text-[#154734] font-bold">
                  ${subtotal.toLocaleString(LOCALE)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Descuento cupón</span>
                  <span className="font-bold">-${discount.toLocaleString(LOCALE)}</span>
                </div>
              )}
            </div>

            {/* Total final */}
            <div className="flex justify-between items-end pt-3 pb-1 border-t border-gray-100">
              <span className="text-[9px] uppercase tracking-[0.25em] font-black text-gray-400">
                Total a pagar
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] text-[#C19A6B] font-bold">COP</span>
                <span
                  className="text-2xl font-light text-[#154734] tracking-tight"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  ${total.toLocaleString(LOCALE)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar — siempre visible en mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#154734] shadow-[0_-4px_24px_rgba(0,0,0,0.18)]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 active:bg-[#103a2a] transition-colors"
          aria-expanded={open}
          aria-label="Ver resumen del pedido"
        >
          {/* Izquierda: ícono + label + badge */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-[#C19A6B]" />
              <span className="absolute -top-1.5 -right-1.5 bg-[#C19A6B] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white">
              Resumen del pedido
            </span>
          </div>

          {/* Derecha: total + flecha */}
          <div className="flex items-center gap-3">
            <span
              className="text-lg font-light text-white tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              ${total.toLocaleString(LOCALE)}
            </span>
            <div
              className={`bg-white/10 rounded-full p-1 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            >
              <ChevronUp className="w-4 h-4 text-[#C19A6B]" />
            </div>
          </div>
        </button>
      </div>
    </>
  );
}
