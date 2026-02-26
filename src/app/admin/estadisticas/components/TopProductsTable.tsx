import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { TOP_PRODUCTS } from "../constants";

function RankBadge({ rank }: { rank: number }) {
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

function TrendBadge({ trend, variant = "desktop" }: { trend: string; variant?: "desktop" | "mobile" }) {
  const isPositive = trend.startsWith("+");

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

export function TopProductsTable() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h3 className="font-bold text-gray-900 text-base sm:text-lg">Productos Más Vendidos</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Ranking por unidades y volumen de ingresos
          </p>
        </div>
        <button className="text-xs sm:text-sm text-[#154734] font-medium hover:underline flex items-center gap-1 self-start sm:self-auto">
          Ver reporte completo <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabla Desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4">Ranking</th>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4 text-center">Unidades</th>
              <th className="px-6 py-4 text-right">Ingresos</th>
              <th className="px-6 py-4 text-center">Tendencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {TOP_PRODUCTS.map((product, i) => (
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
        {TOP_PRODUCTS.map((product, i) => (
          <div key={product.name} className="p-5 flex items-center gap-4">
            <RankBadge rank={i + 1} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate mb-1">{product.name}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-0.5 rounded">{product.sold} vendidos</span>
                <span className="font-semibold text-gray-700">{product.revenue}</span>
              </div>
            </div>
            <TrendBadge trend={product.trend} variant="mobile" />
          </div>
        ))}
      </div>
    </div>
  );
}
