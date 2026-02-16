"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  ArrowUpRight,
} from "lucide-react";

type Period = "day" | "week" | "month";

const periodLabels: Record<Period, string> = {
  day: "Hoy",
  week: "Esta Semana",
  month: "Este Mes",
};

const salesData: Record<Period, { total: string; orders: number; avgTicket: string; newCustomers: number; change: string }> = {
  day: { total: "$1,250,000", orders: 23, avgTicket: "$54,348", newCustomers: 15, change: "+12%" },
  week: { total: "$8,450,000", orders: 142, avgTicket: "$59,507", newCustomers: 87, change: "+8%" },
  month: { total: "$32,800,000", orders: 567, avgTicket: "$57,848", newCustomers: 320, change: "+15%" },
};

const topProducts = [
  { name: "Enterizo Corto Tropical", sold: 85, revenue: "$7,565,000", trend: "+18%" },
  { name: "Set Short Deportivo", sold: 72, revenue: "$9,000,000", trend: "+12%" },
  { name: "Chaqueta Nylon Premium", sold: 58, revenue: "$10,730,000", trend: "+25%" },
  { name: "Body Sport Premium", sold: 45, revenue: "$2,925,000", trend: "+5%" },
  { name: "Set Pant Elegante", sold: 42, revenue: "$6,090,000", trend: "-3%" },
  { name: "Bolso Gym Essential", sold: 38, revenue: "$2,964,000", trend: "+10%" },
];

const dailySales = [
  { day: "Lun", amount: 1200000 },
  { day: "Mar", amount: 980000 },
  { day: "Mié", amount: 1450000 },
  { day: "Jue", amount: 1100000 },
  { day: "Vie", amount: 1800000 },
  { day: "Sáb", amount: 2200000 },
  { day: "Dom", amount: 1720000 },
];

const maxSale = Math.max(...dailySales.map((d) => d.amount));

const categorySales = [
  { name: "Enterizos", percentage: 35, color: "bg-[#154734]" },
  { name: "Sets", percentage: 28, color: "bg-[#1a5c43]" },
  { name: "Bodys", percentage: 18, color: "bg-[#C19A6B]" },
  { name: "Chaquetas", percentage: 12, color: "bg-blue-500" },
  { name: "Accesorios", percentage: 7, color: "bg-purple-500" },
];

export default function AdminEstadisticas() {
  const [period, setPeriod] = useState<Period>("week");
  const data = salesData[period];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estadísticas de Ventas</h1>
          <p className="text-gray-500 text-sm mt-1">Toma decisiones basadas en datos reales</p>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-lg p-1">
          {(Object.keys(periodLabels) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                period === p ? "bg-[#154734] text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-emerald-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {data.change}
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{data.total}</p>
          <p className="text-xs text-gray-500 mt-1">Ventas Totales - {periodLabels[period]}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{data.orders}</p>
          <p className="text-xs text-gray-500 mt-1">Pedidos</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{data.avgTicket}</p>
          <p className="text-xs text-gray-500 mt-1">Ticket Promedio</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-amber-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{data.newCustomers}</p>
          <p className="text-xs text-gray-500 mt-1">Clientes Nuevos</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart - Weekly Sales */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            Ventas por Día
          </h3>
          <div className="flex items-end gap-2 h-48">
            {dailySales.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative group">
                  <div
                    className="w-full bg-[#154734]/80 hover:bg-[#154734] rounded-t-md transition-colors cursor-pointer"
                    style={{ height: `${(day.amount / maxSale) * 160}px` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {formatPrice(day.amount)}
                  </div>
                </div>
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Ventas por Categoría</h3>
          <div className="space-y-4">
            {categorySales.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-gray-700 font-medium">{cat.name}</span>
                  <span className="text-gray-500">{cat.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`${cat.color} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Productos Más Vendidos</h3>
          <p className="text-sm text-gray-500 mt-1">Ranking de productos por unidades vendidas</p>
        </div>

        {/* Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3">Vendidos</th>
                <th className="px-5 py-3">Ingresos</th>
                <th className="px-5 py-3">Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, i) => (
                <tr key={product.name} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < 3 ? "bg-[#C19A6B] text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{product.sold} uds</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900">{product.revenue}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium flex items-center gap-1 ${
                      product.trend.startsWith("+") ? "text-green-600" : "text-red-500"
                    }`}>
                      {product.trend.startsWith("+") ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {product.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="sm:hidden divide-y divide-gray-100">
          {topProducts.map((product, i) => (
            <div key={product.name} className="p-4 flex items-center gap-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i < 3 ? "bg-[#C19A6B] text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500">{product.sold} uds · {product.revenue}</p>
              </div>
              <span className={`text-xs font-medium flex items-center gap-1 shrink-0 ${
                product.trend.startsWith("+") ? "text-green-600" : "text-red-500"
              }`}>
                {product.trend.startsWith("+") ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {product.trend}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
