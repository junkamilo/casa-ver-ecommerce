import { Suspense } from "react";
import type { Period } from "../types/types";
import {
  fetchAvgDeliveryTime,
  fetchCancellationRateByPeriod,
  fetchCategorySalesByPeriod,
  fetchColorsSalesByPeriod,
  fetchDailySalesByPeriod,
  fetchDiscountImpactByPeriod,
  fetchGeographyByPeriod,
  fetchPaymentMethodsByPeriod,
  fetchPeakHoursByPeriod,
  fetchRetentionByPeriod,
  fetchReviewsByPeriod,
  fetchSizesSalesByPeriod,
  fetchStatsByPeriod,
  fetchTopProductsByPeriod,
} from "@/modules/adminCatalog/stats/presentation/api-client";
import { KpiCards } from "./KpiCards";
import { SalesChart } from "./SalesChart";
import { CategoryChart } from "./CategoryChart";
import { TopProductsTable } from "./TopProductsTable";
import { PaymentMethodsChart } from "./PaymentMethodsChart";
import { PeakHoursChart } from "./PeakHoursChart";
import { SizesChart } from "./SizesChart";
import { ColorsChart } from "./ColorsChart";
import { GeographyChart } from "./GeographyChart";
import { DiscountImpactCard } from "./DiscountImpactCard";
import { ReviewsCard } from "./ReviewsCard";
import { DeliveryTimeCard } from "./DeliveryTimeCard";
import { SectionDivider } from "./SectionDivider";

async function loadEstadisticas(period: Period) {
  return Promise.all([
    fetchStatsByPeriod(period),
    fetchTopProductsByPeriod(period, 8),
    fetchDailySalesByPeriod(period),
    fetchCategorySalesByPeriod(period),
    fetchSizesSalesByPeriod(period),
    fetchColorsSalesByPeriod(period),
    fetchPaymentMethodsByPeriod(period),
    fetchGeographyByPeriod(period),
    fetchRetentionByPeriod(period),
    fetchDiscountImpactByPeriod(period),
    fetchCancellationRateByPeriod(period),
    fetchReviewsByPeriod(period),
    fetchAvgDeliveryTime(period),
    fetchPeakHoursByPeriod(period),
  ]);
}

function EstadisticasError() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
      <h3 className="text-sm sm:text-base font-bold text-red-900 mb-2">Error al cargar estadísticas</h3>
      <p className="text-xs sm:text-sm text-red-700">
        Hubo un problema al conectar con la base de datos. Por favor, intenta recargar la página.
      </p>
    </div>
  );
}

async function EstadisticasContentInner({ period }: { period: Period }) {
  let payload: Awaited<ReturnType<typeof loadEstadisticas>> | null = null;
  let loadFailed = false;

  try {
    payload = await loadEstadisticas(period);
  } catch (error) {
    console.error("❌ Error cargando estadísticas:", error);
    loadFailed = true;
  }

  if (loadFailed || !payload) {
    return <EstadisticasError />;
  }

  const [
    statsData,
    topProducts,
    dailySales,
    categorySales,
    sizesSales,
    colorsSales,
    paymentMethods,
    geography,
    retention,
    discountImpact,
    cancellation,
    reviews,
    deliveryTime,
    peakHours,
  ] = payload;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-4">
        <SectionDivider title="Métricas Principales" />
        <KpiCards data={statsData} retention={retention} cancellation={cancellation} />
      </div>

      <div className="space-y-4">
        <SectionDivider title="Tendencias de Ventas" />
        <SalesChart salesData={dailySales} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <PaymentMethodsChart data={paymentMethods} />
          <PeakHoursChart data={peakHours} />
        </div>
      </div>

      <div className="space-y-4">
        <SectionDivider title="Análisis de Productos" />
        <TopProductsTable products={topProducts} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <SizesChart data={sizesSales} />
          <ColorsChart data={colorsSales} />
        </div>
      </div>

      <div className="space-y-4">
        <SectionDivider title="Por Categoría" />
        <CategoryChart categorySales={categorySales} />
      </div>

      <div className="space-y-4">
        <SectionDivider title="Clientes & Descuentos" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <DiscountImpactCard data={discountImpact} />
          <ReviewsCard data={reviews} />
          <DeliveryTimeCard data={deliveryTime} />
        </div>
      </div>

      <div className="space-y-4">
        <SectionDivider title="Distribución Geográfica" />
        <GeographyChart data={geography} />
      </div>
    </div>
  );
}

export async function EstadisticasContent({ period = "week" }: { period?: Period }) {
  return (
    <Suspense fallback={<div className="animate-pulse text-sm text-gray-400">Cargando estadísticas...</div>}>
      <EstadisticasContentInner period={period} />
    </Suspense>
  );
}
