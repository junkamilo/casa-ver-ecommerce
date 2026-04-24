import { fetchLowStockAlerts, fetchOrdersFunnel } from "@/modules/adminCatalog/stats/presentation/api-client";
import { OrdersFunnel } from "./OrdersFunnel";
import { LowStockAlerts } from "./LowStockAlerts";
import { SectionDivider } from "./SectionDivider";

export async function EstadisticasLiveSection() {
  const [funnel, stockAlerts] = await Promise.all([
    fetchOrdersFunnel(),
    fetchLowStockAlerts(),
  ]);

  return (
    <div className="space-y-4">
      <SectionDivider
        title="Operaciones en Vivo"
        subtitle="Estado actual independiente del período seleccionado"
        live
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <OrdersFunnel data={funnel} />
        <LowStockAlerts alerts={stockAlerts} />
      </div>
    </div>
  );
}
