import { Palette, TrendingUp, TrendingDown } from "lucide-react";
import type { ColorSale } from "../types/types";

interface Props {
  data: ColorSale[];
}

export function ColorsChart({ data }: Props) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2 mb-4 sm:mb-6">
        <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-[#C19A6B]" />
        Colores Más Vendidos
      </h3>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-400">
          <p className="text-sm">Sin datos para este período</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, i) => {
            const isPos = !item.trend.startsWith("-");
            const barColor = i === 0 ? "bg-[#154734]" : i === 1 ? "bg-[#C19A6B]" : "bg-gray-300";
            return (
              <div key={item.colorName} className="group">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${barColor}`} />
                    <span className="font-semibold text-gray-800 truncate">{item.colorName}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500 font-medium">{item.units} uds.</span>
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${isPos ? "text-emerald-600" : "text-red-500"}`}>
                      {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {item.trend}
                    </span>
                    <span className="text-xs font-bold text-[#154734] w-8 text-right">{item.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
