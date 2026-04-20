import { AlertTriangle, CheckCircle } from "lucide-react";
import type { StockAlert } from "../types/types";

interface Props {
  alerts: StockAlert[];
}

export function LowStockAlerts({ alerts }: Props) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
            {alerts.length > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            )}
            Stock Crítico
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Variantes en o por debajo del mínimo</p>
        </div>
        {alerts.length > 0 && (
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
            {alerts.length} alerta{alerts.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
          <p className="text-sm font-medium text-emerald-600">Stock en niveles normales</p>
          <p className="text-xs text-gray-400">Todas las variantes activas tienen suficiente inventario</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <div
              key={alert.sku}
              className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 border ${
                alert.stock === 0
                  ? "bg-red-50 border-red-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-800 truncate">{alert.productName}</p>
                <p className="text-[10px] text-gray-500">
                  {alert.colorName} · {alert.size}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`text-sm font-black ${alert.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                  {alert.stock}
                </p>
                <p className="text-[10px] text-gray-400">mín. {alert.minStock}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
