"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingBag, ChevronDown, X, Sparkles } from "lucide-react";
import { LOCALE } from "../constants";
import { calcLineItemDisplayTotals } from "@/modules/checkout/presentation/calculators/line-item-totals";
import type { CheckoutItem, CouponState } from "../types";
import type { ShippingQuote } from "@/lib/shipping";
import OrderTotals from "./shared/OrderTotals";
import FreeShippingBanner from "./shared/FreeShippingBanner";

/** Altura de la barra fija superior (sin safe-area) — mantener en sync con page.tsx pt */
export const MOBILE_ORDER_BAR_HEIGHT = "5.5rem";

interface CheckoutMobileSummaryProps {
  items: CheckoutItem[];
  subtotal: number;
  shippingCost: number;
  shippingQuote: ShippingQuote;
  total: number;
  coupon: CouponState;
  couponDiscount: number;
  lineItemDiscountPercentage?: number;
  isPending?: boolean;
  hidden?: boolean;
}

export default function CheckoutMobileSummary({
  items,
  subtotal,
  shippingCost,
  shippingQuote,
  total,
  coupon,
  couponDiscount,
  lineItemDiscountPercentage = 0,
  hidden = false,
}: CheckoutMobileSummaryProps) {
  const [open, setOpen] = useState(false);
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const discountPercentage = lineItemDiscountPercentage;
  const itemLabel = totalItems === 1 ? "1 prenda" : `${totalItems} prendas`;
  const couponApplied = coupon.status === "valid";

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <>
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Barra superior fija — sticky al hacer scroll */}
      <div
        className={`lg:hidden fixed inset-x-0 top-0 z-[110] bg-[#154734] shadow-[0_4px_24px_rgba(0,0,0,0.18)] pt-[env(safe-area-inset-top,0px)] border-b border-white/10 transition-transform duration-300 ${
          hidden ? "-translate-y-full" : "motion-safe:animate-order-bar-slide-up motion-reduce:animate-none"
        }`}
      >
        {!open && (
          <div
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/30 pointer-events-none motion-safe:animate-order-bar-hint motion-reduce:animate-none"
            aria-hidden
          />
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 min-h-[5.5rem] active:bg-[#103a2a] transition-colors"
          aria-expanded={open}
          aria-label={`Ver pedido: ${itemLabel}, total ${total.toLocaleString(LOCALE)} pesos`}
        >
          <div className="flex items-center gap-3 min-w-0 text-left">
            <div className="relative shrink-0 w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 bg-[#C19A6B] text-white text-[9px] font-black min-w-[1.125rem] h-[1.125rem] px-0.5 rounded-full flex items-center justify-center ring-2 ring-[#154734]">
                {totalItems}
              </span>
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-bold uppercase tracking-[0.1em] text-white">
                Ver pedido
              </span>
              <span className="block text-xs text-white/80 truncate mt-0.5">
                {itemLabel}
                {shippingQuote.isFreeByThreshold
                  ? " · Envío gratis"
                  : couponApplied
                    ? " · Cupón aplicado"
                    : " · Toca para ver detalle"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span
              className="text-xl font-light text-white tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              ${total.toLocaleString(LOCALE)}
            </span>
            <div
              className={`bg-white/20 rounded-full p-2 transition-transform duration-300 ${
                open ? "rotate-180" : "motion-safe:animate-order-bar-hint motion-reduce:animate-none"
              }`}
            >
              <ChevronDown className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </button>
      </div>

      {/* Bottom sheet — detalle del pedido desde el fondo del viewport */}
      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-[100] transition-transform duration-300 ease-in-out pb-[env(safe-area-inset-bottom,0px)] ${
          open ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
        style={{ maxHeight: "min(85dvh, calc(100dvh - env(safe-area-inset-top, 0px)))" }}
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        aria-label="Detalle del pedido"
      >
        <div className="bg-white rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.15)] border-t border-gray-100 flex flex-col h-full max-h-[inherit] overflow-hidden">
          <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden>
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>
          <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100 shrink-0">
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#154734] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C19A6B]" />
              Tu selección
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

          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
            <div className="space-y-3">
              {items.map((item) => {
                const { originalTotal, discountedTotal, showsDiscount } =
                  calcLineItemDisplayTotals(item, discountPercentage);
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 items-center bg-[#FAFAFA] p-3 rounded-2xl border border-gray-100"
                  >
                    <div className="relative w-14 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
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
                    <div className="shrink-0 text-right">
                      {showsDiscount ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[9px] text-gray-400 line-through">
                            ${originalTotal.toLocaleString(LOCALE)}
                          </span>
                          <span className="text-xs font-bold text-emerald-700">
                            ${discountedTotal.toLocaleString(LOCALE)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-[#154734]">
                          ${originalTotal.toLocaleString(LOCALE)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {shippingQuote.isFreeByThreshold && (
              <FreeShippingBanner
                compact
                threshold={shippingQuote.freeShippingThreshold ?? 0}
              />
            )}

            <OrderTotals
              subtotal={subtotal}
              shippingCost={shippingCost}
              shippingQuote={shippingQuote}
              couponDiscount={couponDiscount}
              discountPercentage={discountPercentage > 0 ? discountPercentage : undefined}
              couponCode={couponApplied ? coupon.code : undefined}
              compact
            />

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
    </>
  );
}
