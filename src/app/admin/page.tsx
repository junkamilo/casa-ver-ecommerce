import { fetchDashboardData } from "./queries/dashboard.queries";
import DashboardHeader from "./components/DashboardHeader";
import StatsSection from "./components/StatsSection";
import HorizontalNav from "./components/HorizontalNav";
import NotificationsCard from "./components/NotificationsCard";
import DashboardError from "./components/DashboardError";

export default async function AdminDashboard() {
  try {
    const { stats, recentOrders } = await fetchDashboardData();

    return (
      <div className="space-y-4 sm:space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
        <DashboardHeader />
        <StatsSection stats={stats} />
        <HorizontalNav />
        <NotificationsCard orders={recentOrders} />
      </div>
    );
  } catch (error) {
    console.error("❌ Error cargando metricas del dashboard:", error);
    return <DashboardError />;
  }
}
