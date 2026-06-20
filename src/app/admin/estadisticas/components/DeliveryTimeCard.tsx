import { Truck } from "lucide-react";
import type { DeliveryTimeData } from "../types/types";

interface Props {
  data: DeliveryTimeData;
}

export function DeliveryTimeCard({ data }: Props) {
  const hasData = data.count > 0;

  const getLabel = (days: number) => {
    if (days <= 2) return { text: "Excelente", color: "text-emerald-600" };
    if (days <= 5) return { text: "Bueno", color: "text-blue-600" };
    if (days <= 8) return { text: "Regular", color: "text-yellow-600" };
    return { text: "Demorado", color: "text-red-600" };
  };

  const label = hasData ? getLabel(data.avgDays) : null;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2 mb-4">
        <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#C19A6B]" />
        Tiempo de Entrega
      </h3>

      {!hasData ? (
        <div className="flex items-center justify-center h-20 text-gray-400">
          <p className="text-sm text-center">
            Sin entregas en este período. Esta métrica se habilita al marcar pedidos como Entregado.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-3xl font-black text-gray-900">{data.avgDays}</span>
            <span className="text-sm text-gray-500 mb-1">días promedio</span>
            {label && (
              <span className={`text-xs font-bold mb-1 ml-1 ${label.color}`}>{label.text}</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
              <p className="text-lg font-black text-emerald-700">{data.minDays}</p>
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Mínimo</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5 text-center">
              <p className="text-lg font-black text-gray-700">{data.avgDays}</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Promedio</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-2.5 text-center">
              <p className="text-lg font-black text-orange-700">{data.maxDays}</p>
              <p className="text-[10px] text-orange-600 font-medium mt-0.5">Máximo</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3">Basado en {data.count} pedido{data.count > 1 ? "s" : ""} entregado{data.count > 1 ? "s" : ""}</p>
        </>
      )}
    </div>
  );
}
