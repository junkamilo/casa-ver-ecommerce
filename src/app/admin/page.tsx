import { fetchDashboardData } from "@/modules/adminCatalog/dashboard/presentation/api-client";

export const dynamic = "force-dynamic";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { Plus } from "lucide-react";
import StatsSection from "./components/StatsSection";
import HorizontalNav from "./components/HorizontalNav";
import NotificationsCard from "./components/NotificationsCard";
import DashboardError from "./components/DashboardError";
import OperationsCockpit from "./components/OperationsCockpit";
import PaymentIncidentsCard from "./components/PaymentIncidentsCard";
import { DashboardAutoRefresh } from "./components/DashboardAutoRefresh";

export default async function AdminDashboard() {
  let dashboard: Awaited<ReturnType<typeof fetchDashboardData>> | null = null;
  let loadFailed = false;

  try {
    dashboard = await fetchDashboardData();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Error cargando metricas del dashboard:", message, error);
    loadFailed = true;
  }

  if (loadFailed || !dashboard) {
    return <DashboardError />;
  }

  const { stats, recentOrders, slaQueue, paymentIncidents, backlog, serverNow } =
    dashboard;

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <AdminPageHeader
          title="Panel de Control"
          action={{ label: "Nuevo Producto", href: "/admin/productos?action=new", icon: Plus }}
        />
        <DashboardAutoRefresh serverNow={serverNow} />
      </div>

      <StatsSection stats={stats} />

      <OperationsCockpit slaQueue={slaQueue} backlog={backlog} />

      <PaymentIncidentsCard incidents={paymentIncidents} />

      <HorizontalNav />

      <NotificationsCard orders={recentOrders} />
    </div>
  );
}
