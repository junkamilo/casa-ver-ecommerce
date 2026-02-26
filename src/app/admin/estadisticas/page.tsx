"use client";

import { useEstadisticas } from "./hooks/useEstadisticas";
import { EstadisticasHeader } from "./components/EstadisticasHeader";
import { KpiCards } from "./components/KpiCards";
import { SalesChart } from "./components/SalesChart";
import { CategoryChart } from "./components/CategoryChart";
import { TopProductsTable } from "./components/TopProductsTable";

export default function AdminEstadisticas() {
  const { period, setPeriod, data } = useEstadisticas();

  return (
    <div className="space-y-6 sm:space-y-8 p-3 sm:p-6 bg-gray-50 min-h-screen font-sans">
      <EstadisticasHeader period={period} onPeriodChange={setPeriod} />
      <KpiCards data={data} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <SalesChart />
        <CategoryChart />
      </div>
      <TopProductsTable />
    </div>
  );
}
