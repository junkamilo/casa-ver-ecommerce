import { Tag } from "lucide-react";
import type { DiscountData } from "../types/types";

interface Props {
  data: DiscountData;
}

export function DiscountImpactCard({ data }: Props) {
  const hasDiscounts = data.discountedOrders > 0;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2 mb-4">
        <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-[#C19A6B]" />
        Impacto de Descuentos
      </h3>

      {!hasDiscounts ? (
        <div className="flex items-center justify-center h-20 text-gray-400">
          <p className="text-sm">Sin descuentos en este período</p>
        </div>
      ) : (
        <>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-2xl font-black text-gray-900">{data.totalDiscount}</span>
            <span className="text-sm text-gray-500 mb-1">en descuentos ({data.percentageOfRevenue} del ingreso bruto)</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-lg p-2.5 text-center">
              <p className="text-xl font-black text-gray-800">{data.couponsUsed}</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Cupones</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5 text-center">
              <p className="text-xl font-black text-gray-800">{data.discountedOrders}</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Pedidos con descuento</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3">
            {data.discountedOrders} pedido{data.discountedOrders > 1 ? "s" : ""} con descuento aplicado
          </p>
        </>
      )}
    </div>
  );
}
