import { Truck } from "lucide-react";
import { LOCALE } from "../../constants";

interface OrderTotalsProps {
  subtotal: number;
  earlyBirdDiscount: number;
  shippingCost: number;
  /** compact=true → estilos reducidos para el panel mobile */
  compact?: boolean;
}

/**
 * Desglose de totales reutilizable para desktop y mobile summary panels.
 */
export default function OrderTotals({
  subtotal,
  earlyBirdDiscount,
  shippingCost,
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
        <div className="flex justify-between items-center text-[#154734]">
          <span>Descuento (10%)</span>
          <span className="font-bold text-[#C19A6B]">-${earlyBirdDiscount.toLocaleString(LOCALE)}</span>
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
    </div>
  );
}
