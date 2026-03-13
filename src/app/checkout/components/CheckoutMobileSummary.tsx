import Image from "next/image";
import { ShoppingBag, ChevronDown } from "lucide-react";
import { LOCALE } from "../constants/constants";
import type { CheckoutItem } from "../types/types";

interface CheckoutMobileSummaryProps {
  items: CheckoutItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
}

const CheckoutMobileSummary = ({
  items,
  subtotal,
  shippingCost,
  discount,
  total,
}: CheckoutMobileSummaryProps) => (
  <div className="lg:hidden bg-[#154734] border-b border-[#C19A6B]/30 px-4 sm:px-6 md:px-8 py-4 sm:py-5 z-40 sticky top-0 shadow-md transition-colors">
    <details className="group">
      <summary className="flex items-center justify-between cursor-pointer list-none text-white touch-target p-2 -m-2 active:scale-95">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] flex items-center gap-2 sm:gap-3">
          <ShoppingBag className="w-4 h-4 text-[#C19A6B] shrink-0" />
          Resumen del pedido
          <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 text-[#C19A6B] shrink-0" />
        </span>
        <span className="text-base sm:text-lg font-light tracking-wider ml-4" style={{ fontFamily: "Georgia, serif" }}>
          ${total.toLocaleString(LOCALE)}
        </span>
      </summary>

      <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-5 bg-white -mx-4 sm:-mx-6 md:-mx-8 -mb-5 p-4 sm:p-6 md:p-8 shadow-inner rounded-b-2xl sm:rounded-b-3xl">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 sm:gap-4 items-start sm:items-center">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl border border-gray-100 bg-[#FAFAFA] overflow-hidden shrink-0 shadow-sm">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
              <span className="absolute top-0 right-0 bg-[#C19A6B] text-white text-[9px] sm:text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-bl-lg sm:rounded-bl-xl z-10 shadow-sm">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#154734] uppercase tracking-wide truncate">
                {item.name}
              </p>
              <p className="text-[10px] sm:text-[11px] text-gray-500 uppercase tracking-widest mt-0.5">{item.color}</p>
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#154734] shrink-0 whitespace-nowrap ml-2">
              ${(item.price * item.quantity).toLocaleString(LOCALE)}
            </span>
          </div>
        ))}

        <div className="pt-4 sm:pt-5 border-t border-gray-100 space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between text-gray-500 font-medium">
            <span>Subtotal</span>
            <span className="text-[#154734] font-bold">${subtotal.toLocaleString(LOCALE)}</span>
          </div>
          <div className="flex justify-between text-gray-500 font-medium">
            <span>Envío Nacional</span>
            <span className="text-[#154734] font-bold">${shippingCost.toLocaleString(LOCALE)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Descuento cupón</span>
              <span className="font-bold">-${discount.toLocaleString(LOCALE)}</span>
            </div>
          )}
        </div>

        <div className="pt-3 sm:pt-4 border-t border-gray-100 flex justify-between items-end">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">Total</span>
          <span className="text-xl sm:text-2xl font-light text-[#154734] tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
            ${total.toLocaleString(LOCALE)}
          </span>
        </div>
      </div>
    </details>
  </div>
);

export default CheckoutMobileSummary;
