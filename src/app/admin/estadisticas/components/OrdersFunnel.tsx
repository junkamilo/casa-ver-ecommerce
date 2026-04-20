import { ArrowRight } from "lucide-react";
import type { FunnelItem } from "../types/types";

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  yellow:  { bg: "bg-yellow-50",  text: "text-yellow-700",  border: "border-yellow-200",  dot: "bg-yellow-400" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-400"   },
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  dot: "bg-indigo-500" },
  purple:  { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  dot: "bg-purple-400" },
  green:   { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500"},
  red:     { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-400"    },
  rose:    { bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-200",    dot: "bg-rose-400"   },
  gray:    { bg: "bg-gray-50",    text: "text-gray-600",    border: "border-gray-200",    dot: "bg-gray-400"   },
};

interface Props {
  data: FunnelItem[];
}

export function OrdersFunnel({ data }: Props) {
  const actionable = data.filter((d) => d.actionable);
  const informational = data.filter((d) => !d.actionable);
  const totalOrders = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h3 className="font-bold text-gray-900 text-sm sm:text-base">Estado de Pedidos</h3>
        <p className="text-xs text-gray-400 mt-0.5">{totalOrders} pedidos totales en la plataforma</p>
      </div>

      {/* Acciones requeridas */}
      {actionable.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Requieren atención</p>
          <div className="flex flex-wrap items-center gap-2">
            {actionable.map((item, i) => {
              const c = COLOR_MAP[item.color] ?? COLOR_MAP.gray;
              return (
                <div key={item.status} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 ${c.bg} ${c.border} border rounded-xl px-3 py-2.5 min-w-[90px]`}>
                    <span className={`w-2 h-2 rounded-full ${c.dot} animate-pulse`} />
                    <div>
                      <p className={`text-xs font-semibold ${c.text}`}>{item.label}</p>
                      <p className={`text-lg font-black ${c.text}`}>{item.count}</p>
                    </div>
                  </div>
                  {i < actionable.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resto de estados */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Estado general</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {informational.map((item) => {
            const c = COLOR_MAP[item.color] ?? COLOR_MAP.gray;
            const pct = totalOrders > 0 ? Math.round((item.count / totalOrders) * 100) : 0;
            return (
              <div key={item.status} className="bg-gray-50 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                </div>
                <p className="text-xl font-black text-gray-800">{item.count}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{pct}% del total</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
