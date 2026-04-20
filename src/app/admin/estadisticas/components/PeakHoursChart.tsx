import { Clock } from "lucide-react";
import type { PeakHourData } from "../types/types";

interface Props {
  data: PeakHourData[];
}

export function PeakHoursChart({ data }: Props) {
  const top3 = [...data].sort((a, b) => b.orders - a.orders).slice(0, 3);
  const maxOrders = Math.max(...data.map((d) => d.orders), 1);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);

  const isEmpty = totalOrders === 0;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#C19A6B]" />
          Horas Pico
        </h3>
        {!isEmpty && (
          <div className="flex gap-1.5">
            {top3.map((h, i) => (
              <span
                key={h.hour}
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  i === 0 ? "bg-[#154734] text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {h.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center h-24 text-gray-400">
          <p className="text-sm">Sin datos para este período</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex items-end gap-0.5 h-24 min-w-[480px] sm:min-w-0">
            {data.map((hour) => {
              const isTop = top3.some((t) => t.hour === hour.hour);
              const height = maxOrders > 0 ? Math.max((hour.orders / maxOrders) * 100, hour.orders > 0 ? 4 : 0) : 0;
              return (
                <div
                  key={hour.hour}
                  className="flex-1 flex flex-col items-center gap-1 group h-full justify-end"
                  title={`${hour.label}: ${hour.orders} pedidos`}
                >
                  <div
                    className={`w-full rounded-t transition-all duration-500 ${
                      isTop ? "bg-[#154734]" : "bg-gray-200 group-hover:bg-[#C19A6B]"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  {hour.hour % 6 === 0 && (
                    <span className="text-[8px] text-gray-400 font-medium">{hour.hour}h</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
