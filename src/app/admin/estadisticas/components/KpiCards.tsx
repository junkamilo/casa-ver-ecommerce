import { DollarSign, ShoppingCart, Package, Users, TrendingUp } from "lucide-react";
import type { KpiCardsProps } from "../types/types";

export function KpiCards({ data }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {/* Ingresos Totales */}
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

      {/* Pedidos Realizados */}
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
  );
}
