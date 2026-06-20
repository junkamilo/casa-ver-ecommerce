import {
  DollarSign, ShoppingCart, Package, Users,
  TrendingUp, TrendingDown, RefreshCw, XCircle,
} from "lucide-react";
import type { KpiCardsProps } from "../types/types";

function ChangeIndicator({ change }: { change: string }) {
  const isNegative = change.startsWith("-");
  return (
    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
      isNegative ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50"
    }`}>
      {isNegative ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
      {change}
    </span>
  );
}

export function KpiCards({ data, retention, cancellation }: KpiCardsProps) {
  const cancellationNum = parseInt(cancellation.rate);
  const retentionHigh = retention.returningPercentage >= 30;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {/* Ingresos Totales */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#154734]/10 rounded-lg text-[#154734]">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <ChangeIndicator change={data.change} />
          </div>
          <p className="text-xs text-gray-500 font-medium">Ingresos</p>
          <h3 className="text-base sm:text-xl font-bold text-gray-900 mt-0.5 truncate">{data.total}</h3>
        </div>
      </div>

      {/* Ventas Confirmadas */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#C19A6B]/10 rounded-lg text-[#C19A6B]">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium">Ventas Confirmadas</p>
          <h3 className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">{data.orders}</h3>
        </div>
      </div>

      {/* Ticket Promedio */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium">Ticket Prom.</p>
          <h3 className="text-base sm:text-xl font-bold text-gray-900 mt-0.5 truncate">{data.avgTicket}</h3>
        </div>
      </div>

      {/* Clientes Nuevos */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gray-100 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium">Clientes Nuevos</p>
          <h3 className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">{data.newCustomers}</h3>
        </div>
      </div>

      {/* Retención */}
      <div className={`bg-white rounded-xl border p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${
        retentionHigh ? "border-emerald-100" : "border-gray-100"
      }`}>
        <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110 ${
          retentionHigh ? "bg-emerald-50" : "bg-gray-50"
        }`} />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${retentionHigh ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              retentionHigh ? "text-emerald-700 bg-emerald-50" : "text-gray-500 bg-gray-100"
            }`}>
              {retention.returningPercentage}%
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Retención</p>
          <h3 className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">{retention.returning} recur.</h3>
          <p className="text-xs text-gray-400 mt-0.5">de {retention.totalBuyers} compradores</p>
        </div>
      </div>

      {/* Cancelaciones */}
      <div className={`bg-white rounded-xl border p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${
        cancellationNum > 10 ? "border-red-100" : "border-gray-100"
      }`}>
        <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110 ${
          cancellationNum > 10 ? "bg-red-50" : "bg-gray-50"
        }`} />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${cancellationNum > 10 ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"}`}>
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              cancellationNum > 10 ? "text-red-600 bg-red-50" : "text-gray-500 bg-gray-100"
            }`}>
              {cancellation.rate}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Cancelaciones</p>
          <h3 className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">{cancellation.cancelled} pedidos</h3>
          <p className="text-xs text-gray-400 mt-0.5 truncate">-{cancellation.lostRevenue}</p>
        </div>
      </div>
    </div>
  );
}
