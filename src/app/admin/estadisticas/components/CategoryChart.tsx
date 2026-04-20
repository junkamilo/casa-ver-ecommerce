"use client";

import { useState } from "react";
import {
  PieChart,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Layers,
  ShoppingCart,
  Receipt,
  Tag,
  Star,
} from "lucide-react";
import type { CategoryChartProps, CategorySale } from "../types/types";

function TrendPill({ trend }: { trend: string }) {
  const isNeg = trend.startsWith("-");
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
        isNeg ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50"
      }`}
    >
      {isNeg ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
      {trend}
    </span>
  );
}

function StatChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg px-2.5 py-2">
      <div className="flex items-center gap-1 text-gray-400 mb-0.5">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wide truncate">{label}</span>
      </div>
      <div className="font-bold text-gray-800 text-xs sm:text-sm truncate">{value}</div>
    </div>
  );
}

function CategoryRow({ cat }: { cat: CategorySale }) {
  return (
    <div className="p-4 sm:p-6 group hover:bg-gray-50/60 transition-colors">
      {/* Nombre + tendencia + ingresos */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className={`w-3 h-3 rounded-full shrink-0 ${cat.color}`} />
          <span className="font-bold text-gray-900 text-sm sm:text-base truncate group-hover:text-[#154734] transition-colors">
            {cat.name}
          </span>
          <TrendPill trend={cat.trend} />
        </div>
        <div className="shrink-0 text-right">
          <div className="font-bold text-gray-900 text-sm sm:text-base">{cat.revenue}</div>
          <div className="text-xs text-gray-400 mt-0.5">{cat.percentage}% del total</div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
        <div
          className={`${cat.color} h-2 rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${cat.percentage}%` }}
        />
      </div>

      {/* Grid de métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <StatChip
          icon={<Layers className="w-3 h-3" />}
          label="Unidades"
          value={`${cat.units} uds.`}
        />
        <StatChip
          icon={<ShoppingCart className="w-3 h-3" />}
          label="Pedidos"
          value={`${cat.orders}`}
        />
        <StatChip
          icon={<Receipt className="w-3 h-3" />}
          label="Ticket prom."
          value={cat.avgTicket}
        />
        <StatChip
          icon={<Tag className="w-3 h-3" />}
          label="Activos"
          value={`${cat.activeProducts} productos`}
        />
      </div>

      {/* Producto estrella */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
        <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <p className="text-xs text-gray-600 truncate">
          <span className="font-semibold text-gray-800">{cat.topProduct}</span>
          {cat.topProductUnits > 0 && (
            <span className="text-gray-400 ml-1.5">— {cat.topProductUnits} uds. vendidas</span>
          )}
        </p>
      </div>
    </div>
  );
}

export function CategoryChart({ categorySales }: CategoryChartProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-[#C19A6B]" />
            Categorías Top
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Desglose por ingresos, volumen y producto estrella
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 hover:border-[#154734] hover:text-[#154734] text-gray-400 transition-all active:scale-90"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
          />
        </button>
      </div>

      {open &&
        (categorySales.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 text-gray-400 py-16">
            <PieChart className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Sin datos para este período</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categorySales.map((cat) => (
              <CategoryRow key={cat.name} cat={cat} />
            ))}
          </div>
        ))}
    </div>
  );
}
