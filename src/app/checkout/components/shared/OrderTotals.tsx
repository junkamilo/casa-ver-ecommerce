import { Truck, TicketPercent } from "lucide-react";
import { LOCALE } from "../../constants";

interface OrderTotalsProps {
  subtotal: number;
  shippingCost: number;
  couponDiscount?: number;
  discountPercentage?: number;
  couponCode?: string;
  /** compact=true → estilos reducidos para el panel mobile */
  compact?: boolean;
}

export default function OrderTotals({
  subtotal,
  shippingCost,
  couponDiscount = 0,
  discountPercentage,
  couponCode,
  compact = false,
}: OrderTotalsProps) {
  const hasDiscount = couponDiscount > 0;

  return (
    <div
      className={`text-sm text-gray-500 font-medium ${
        compact
          ? "space-y-2.5 pt-1 border-t border-gray-100"
          : "space-y-4 mb-8 px-2"
      }`}
    >
      <div className="flex justify-between items-center">
        <span>Subtotal</span>
        <span className="text-[#154734] font-bold">${subtotal.toLocaleString(LOCALE)}</span>
      </div>

      {hasDiscount && (
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <TicketPercent className="w-3 h-3 text-emerald-600" />
            Descuento cupón
            {discountPercentage != null && (
              <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                −{discountPercentage}%
              </span>
            )}
          </span>
          <span className="text-emerald-700 font-bold">
            −${couponDiscount.toLocaleString(LOCALE)}
          </span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="flex items-center gap-1.5">
          <Truck className="w-3 h-3 text-[#C19A6B]" />
          Envío
        </span>
        {shippingCost > 0 ? (
          <span className="text-[#154734] font-bold">
            +${shippingCost.toLocaleString(LOCALE)}
          </span>
        ) : (
          <span className="text-gray-400 italic text-xs">por calcular</span>
        )}
      </div>

      {hasDiscount && couponCode && !compact && (
        <p className="text-[10px] text-emerald-600/80 font-medium text-right -mt-2">
          Cupón {couponCode} aplicado
        </p>
      )}
    </div>
  );
}
