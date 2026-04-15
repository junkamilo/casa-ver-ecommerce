"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import { LOCALE } from "../constants";
import type { CheckoutItem, CouponState } from "../types";
import CouponInput from "./shared/CouponInput";
import EarlyBirdBadge from "./shared/EarlyBirdBadge";
import OrderTotals from "./shared/OrderTotals";

interface OrderSummaryPanelProps {
  items: CheckoutItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  couponDiscount: number;
  earlyBirdDiscount: number;
  earlyBirdActive: boolean;
  total: number;
  coupon: CouponState;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => void;
}

const OrderSummaryPanel = ({
  items,
  subtotal,
  shippingCost,
  couponDiscount,
  earlyBirdDiscount,
  earlyBirdActive,
  total,
  coupon,
  onApplyCoupon,
  onRemoveCoupon,
}: OrderSummaryPanelProps) => {
  return (
    <div className="hidden lg:flex lg:w-[45%] bg-[#154734] px-8 xl:px-16 pt-16 pb-20 justify-center relative overflow-hidden isolate shadow-2xl">
      {/* Fondos decorativos */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#C19A6B 1px, transparent 1px)", backgroundSize: "32px 32px" }}
      />
      <div className="absolute top-0 right-0 w-160 h-160 bg-[#C19A6B] opacity-10 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3" />

      <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.3)] h-fit sticky top-16 overflow-hidden isolate border border-white/10">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-[#C19A6B]/50 via-[#C19A6B] to-[#C19A6B]/50" />

        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center justify-center gap-3 border-b border-gray-100 pb-5">
          <Sparkles className="w-4 h-4 text-[#C19A6B]" />
          Tu Selección Casa Verde
        </h3>

        {/* Productos */}
        <div className="space-y-6 mb-10 max-h-[45vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-5 items-center group/item bg-[#FAFAFA] p-3 rounded-2xl border border-transparent hover:border-[#C19A6B]/30 hover:bg-white transition-all duration-300"
            >
              <div className="relative w-20 h-24 rounded-xl overflow-hidden shrink-0 shadow-sm group-hover/item:shadow-md transition-shadow">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover/item:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-0 right-0 bg-[#154734] text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-bl-xl z-10 shadow-sm">
                  {item.quantity}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#154734] uppercase tracking-wide truncate group-hover/item:text-[#C19A6B] transition-colors">
                  {item.name}
                </p>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1">
                  {item.color} · {item.size}
                </p>
              </div>
              <span className="text-sm font-bold text-[#154734]">
                ${(item.price * item.quantity).toLocaleString(LOCALE)}
              </span>
            </div>
          ))}
        </div>

        {earlyBirdActive && <EarlyBirdBadge />}

        {/* Cupón */}
        <div className="mb-10">
          <CouponInput coupon={coupon} onApply={onApplyCoupon} onRemove={onRemoveCoupon} />
        </div>

        <OrderTotals
          subtotal={subtotal}
          shippingCost={shippingCost}
          earlyBirdDiscount={earlyBirdDiscount}
          couponDiscount={couponDiscount}
        />

        {/* Total final */}
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
