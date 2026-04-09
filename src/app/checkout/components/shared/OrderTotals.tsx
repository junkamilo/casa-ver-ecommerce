import { Star } from "lucide-react";
import { LOCALE } from "../../constants";

interface OrderTotalsProps {
  subtotal: number;
  earlyBirdDiscount: number;
  couponDiscount: number;
  /** compact=true → estilos reducidos para el panel mobile */
  compact?: boolean;
}

/**
 * Desglose de totales reutilizable para desktop y mobile summary panels.
 */
export default function OrderTotals({
  subtotal,
  earlyBirdDiscount,
  couponDiscount,
  compact = false,
}: OrderTotalsProps) {
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

      {earlyBirdDiscount > 0 && (
        <div className="flex justify-between items-center text-amber-600">
          <span className="flex items-center gap-1.5">
            <Star className="w-3 h-3 fill-amber-400" />
            Early Bird (10%)
          </span>
          <span className="font-bold">-${earlyBirdDiscount.toLocaleString(LOCALE)}</span>
        </div>
      )}

      {couponDiscount > 0 && (
        <div className="flex justify-between items-center text-green-600">
          <span>Descuento cupón</span>
          <span className="font-bold">-${couponDiscount.toLocaleString(LOCALE)}</span>
        </div>
      )}
    </div>
  );
}
