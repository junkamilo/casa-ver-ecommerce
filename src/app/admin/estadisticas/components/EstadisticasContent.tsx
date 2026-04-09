import { Suspense } from "react";
import type { Period } from "../types/types";
import { getStatsByPeriod, getTopProductsByPeriod, getDailySalesByPeriod, getCategorySalesByPeriod } from "../utils/stats";
import { KpiCards } from "./KpiCards";
import { SalesChart } from "./SalesChart";
import { CategoryChart } from "./CategoryChart";
import { TopProductsTable } from "./TopProductsTable";

async function EstadisticasContentInner({ period }: { period: Period }) {
  try {
    // Fetch all statistics data in parallel
    const [statsData, topProducts, dailySales, categorySales] = await Promise.all([
      getStatsByPeriod(period),
      getTopProductsByPeriod(period, 6),
      getDailySalesByPeriod(period),
      getCategorySalesByPeriod(period),
    ]);

    return (
      <>
        <KpiCards data={statsData} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <SalesChart salesData={dailySales} />
          <CategoryChart categorySales={categorySales} />
        </div>
        <TopProductsTable products={topProducts} />
      </>
    );
  } catch (error) {
    console.error("❌ Error cargando estadísticas:", error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-bold text-red-900 mb-2">Error al cargar estadísticas</h3>
        <p className="text-xs sm:text-sm text-red-700">
          Hubo un problema al conectar con la base de datos. Por favor, intenta recargar la página.
        </p>
      </div>
    );
  }
}

export async function EstadisticasContent({ period = "week" }: { period?: Period }) {
  return (
    <Suspense fallback={<div className="animate-pulse">Cargando...</div>}>
      <EstadisticasContentInner period={period} />
    </Suspense>
  );
}
