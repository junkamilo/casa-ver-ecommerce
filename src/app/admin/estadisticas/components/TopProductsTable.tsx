"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, ChevronDown, Package } from "lucide-react";
import type { TopProductsTableProps, RankBadgeProps, TrendBadgeProps } from "../types/types";

function RankBadge({ rank }: RankBadgeProps) {
  const className = `w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
    rank === 1
      ? "bg-[#C19A6B] text-white ring-2 ring-[#C19A6B]/30"
      : rank === 2
      ? "bg-gray-400 text-white"
      : rank === 3
      ? "bg-orange-300 text-white"
      : "bg-gray-100 text-gray-500"
  }`;
  return <span className={className}>{rank}</span>;
}

function TrendBadge({ trend, variant = "desktop" }: TrendBadgeProps) {
  const isPositive = !trend.startsWith("-");

  if (variant === "desktop") {
    return (
      <span
        className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded ${
          isPositive ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
        }`}
      >
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {trend}
      </span>
    );
  }

  return (
    <span
      className={`text-xs font-bold flex items-center gap-1 ${
        isPositive ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {trend}
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
    </span>
  );
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base sm:text-lg">Productos Más Vendidos</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Ranking por unidades y volumen de ingresos
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 hover:border-[#154734] hover:text-[#154734] text-gray-400 transition-all active:scale-90"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
        </button>
      </div>

      {open && (
        products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
            <Package className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Sin productos vendidos en este período</p>
          </div>
        ) : (
          <>
            {/* Tabla Desktop */}
            <div className="hidden sm:block overflow-auto max-h-150">
              <table className="w-full">
                <thead>
                  <tr className="sticky top-0 z-10 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4">Ranking</th>
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4 text-center">Unidades</th>
                    <th className="px-6 py-4 text-right">Ingresos</th>
                    <th className="px-6 py-4 text-center">vs Período Anterior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product, i) => (
                    <tr
                      key={product.name}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <RankBadge rank={i + 1} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-[#154734] transition-colors">
                          {product.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                          {product.sold}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-gray-900">{product.revenue}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <TrendBadge trend={product.trend} variant="desktop" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Lista Móvil */}
            <div className="sm:hidden divide-y divide-gray-100">
              {products.map((product, i) => (
                <div key={product.name} className="p-4 flex items-center gap-3">
                  <RankBadge rank={i + 1} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate mb-1">{product.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">{product.sold} vendidos</span>
                      <span className="font-semibold text-gray-700">{product.revenue}</span>
                    </div>
                  </div>
                  <TrendBadge trend={product.trend} variant="mobile" />
                </div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
}
