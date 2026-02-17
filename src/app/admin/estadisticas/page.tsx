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
  BarChart3,
  PieChart
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

// Colores actualizados a la marca
const categorySales = [
  { name: "Enterizos", percentage: 35, color: "bg-[#154734]" }, // Verde Marca
  { name: "Sets", percentage: 28, color: "bg-[#C19A6B]" },     // Dorado Marca
  { name: "Bodys", percentage: 18, color: "bg-[#0f2e22]" },    // Verde Oscuro
  { name: "Chaquetas", percentage: 12, color: "bg-[#e5d0b1]" }, // Beige Dorado
  { name: "Accesorios", percentage: 7, color: "bg-gray-400" },  // Neutro
];

export default function AdminEstadisticas() {
  const [period, setPeriod] = useState<Period>("week");
  const data = salesData[period];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);

  return (
    <div className="space-y-6 sm:space-y-8 p-3 sm:p-6 bg-gray-50 min-h-screen font-sans">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#154734]" style={{ fontFamily: 'Georgia, serif' }}>Estadísticas</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2 text-xs sm:text-sm">
            <BarChart3 className="w-4 h-4" />
            Visión general del rendimiento de la tienda
          </p>
        </div>

        {/* Selector de Periodo Estilizado */}
        <div className="bg-white border border-gray-200 rounded-full p-1 flex shadow-sm self-start md:self-auto">
          {(Object.keys(periodLabels) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                period === p
                  ? "bg-[#154734] text-white shadow-md"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* Ventas Totales */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-[#154734]/10 rounded-lg sm:rounded-xl text-[#154734]">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {data.change}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Ingresos Totales</p>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{data.total}</h3>
          </div>
        </div>

        {/* Pedidos */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-[#C19A6B]/10 rounded-lg sm:rounded-xl text-[#C19A6B]">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Pedidos Realizados</p>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{data.orders}</h3>
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl text-blue-600">
                <Package className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Ticket Promedio</p>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{data.avgTicket}</h3>
          </div>
        </div>

        {/* Clientes Nuevos */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-gray-100 rounded-lg sm:rounded-xl text-gray-600">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Clientes Nuevos</p>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{data.newCustomers}</h3>
          </div>
        </div>
      </div>

      {/* --- GRÁFICOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Gráfico de Barras (Ocupa 2 columnas) */}
        <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#C19A6B]" />
              Resumen de Ventas
            </h3>
          </div>

          <div className="flex items-end gap-2 sm:gap-6 h-48 sm:h-64 w-full">
            {dailySales.map((day, i) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                <div className="w-full relative h-full flex items-end">
                  <div
                    className="w-full bg-[#154734] rounded-t-lg transition-all duration-500 ease-out group-hover:bg-[#C19A6B] relative"
                    style={{ height: `${(day.amount / maxSale) * 100}%`, opacity: 0.8 + (i * 0.03) }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-10 font-medium">
                      {formatPrice(day.amount)}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-500 group-hover:text-[#154734] transition-colors">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Categorías (Ocupa 1 columna) */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base">
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-[#C19A6B]" />
            Categorías Top
          </h3>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {categorySales.map((cat) => (
              <div key={cat.name} className="group">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-700 font-semibold group-hover:text-[#154734] transition-colors">{cat.name}</span>
                  <span className="text-gray-500 text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full">{cat.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${cat.color} h-2 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- TOP PRODUCTOS --- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">Productos Más Vendidos</h3>
            <p className="text-xs sm:text-sm text-gray-500">Ranking por unidades y volumen de ingresos</p>
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
              {topProducts.map((product, i) => (
                <tr key={product.name} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                      i === 0 ? "bg-[#C19A6B] text-white ring-2 ring-[#C19A6B]/30" : 
                      i === 1 ? "bg-gray-400 text-white" :
                      i === 2 ? "bg-orange-300 text-white" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {i + 1}
                    </span>
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
                        <span className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded ${
                        product.trend.startsWith("+") 
                            ? "text-emerald-700 bg-emerald-50" 
                            : "text-red-700 bg-red-50"
                        }`}>
                        {product.trend.startsWith("+") ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {product.trend}
                        </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lista Móvil */}
        <div className="sm:hidden divide-y divide-gray-100">
          {topProducts.map((product, i) => (
            <div key={product.name} className="p-5 flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                      i === 0 ? "bg-[#C19A6B] text-white" : 
                      i === 1 ? "bg-gray-400 text-white" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {i + 1}
                  </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate mb-1">{product.name}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{product.sold} vendidos</span>
                    <span className="font-semibold text-gray-700">{product.revenue}</span>
                </div>
              </div>
              
              <span className={`text-xs font-bold flex items-center gap-1 ${
                product.trend.startsWith("+") ? "text-emerald-600" : "text-red-600"
              }`}>
                {product.trend}
                {product.trend.startsWith("+") ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
