import Link from "next/link";
import {
  Package,
  ClipboardList,
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  ArrowUpRight,
  Plus,
  Clock,
  CreditCard
} from "lucide-react";
import { prisma } from "@/lib/prisma";

// --- HELPER: Formatea moneda COP ---
const formatCOP = (amount: number | bigint | string) => {
  const num = typeof amount === 'bigint' ? Number(amount) : Number(amount);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// --- HELPER: Calcula rango de hoy en UTC ---
const getTodayRange = () => {
  const startDate = new Date();
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setUTCHours(23, 59, 59, 999);

  return { startDate, endDate };
};

// --- HELPER: Calcula rango de últimos 30 días ---
const getLast30DaysRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  return { startDate, endDate };
};

// --- MAPEO: OrderStatus → Etiquetas UI ---
const mapOrderStatus = (status: string): { label: string; styleClass: string } => {
  const statusMap: Record<string, { label: string; styleClass: string }> = {
    PAID: { label: "Pagado", styleClass: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    PENDING: { label: "Pendiente", styleClass: "bg-amber-50 text-amber-700 border-amber-200" },
    PROCESSING: { label: "Procesando", styleClass: "bg-blue-50 text-blue-700 border-blue-200" },
    SHIPPED: { label: "Enviado", styleClass: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    DELIVERED: { label: "Entregado", styleClass: "bg-green-50 text-green-700 border-green-200" },
    CANCELLED: { label: "Cancelado", styleClass: "bg-red-50 text-red-700 border-red-200" },
    FAILED: { label: "Fallido", styleClass: "bg-red-50 text-red-700 border-red-200" },
  };
  return statusMap[status] || { label: status, styleClass: "bg-gray-100 text-gray-800" };
};

// --- HELPER: Calcula tiempo relativo ---
const timeAgo = (date: Date): string => {
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsAgo < 60) return "Hace unos segundos";
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `Hace ${minutesAgo} min`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `Hace ${hoursAgo} hora${hoursAgo > 1 ? "s" : ""}`;
  const daysAgo = Math.floor(hoursAgo / 24);
  return `Hace ${daysAgo} día${daysAgo > 1 ? "s" : ""}`;
};

export default async function AdminDashboard() {
  try {
    // --- MÉTRICA 1: Ventas de Hoy (Sum de órdenes PAID) ---
    const { startDate: todayStart, endDate: todayEnd } = getTodayRange();

    const todaySalesResult = await prisma.order.aggregate({
      where: {
        status: "PAID",
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      _sum: {
        total: true,
      },
    });

    const todaySales = todaySalesResult._sum.total
      ? Number(todaySalesResult._sum.total)
      : 0;

    // --- MÉTRICA 2: Pedidos Hoy (Conteo total, independiente del estado) ---
    const todayOrdersCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // --- MÉTRICA 3: Productos Activos ---
    const activeProductsCount = await prisma.product.count({
      where: {
        status: "ACTIVE",
      },
    });

    // --- MÉTRICA 4: Clientes Nuevos (últimos 30 días) ---
    const { startDate: thirtyDaysAgo } = getLast30DaysRange();

    const newCustomersCount = await prisma.user.count({
      where: {
        role: "USER",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // --- PEDIDOS RECIENTES (últimas 8 órdenes PAID ordenadas por fecha descendente) ---
    const recentOrders = await prisma.order.findMany({
      where: {
        status: "PAID",
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        paymentMethod: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    });

    // --- CONSTRUIR ARRAY DE STATS ---
    const stats = [
      {
        label: "Ventas Hoy",
        value: formatCOP(todaySales),
        change: "+0%",
        icon: DollarSign,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
      },
      {
        label: "Pedidos Hoy",
        value: todayOrdersCount.toString(),
        change: `${todayOrdersCount > 0 ? "+" : ""}${todayOrdersCount}`,
        icon: ShoppingCart,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
      },
      {
        label: "Productos Activos",
        value: activeProductsCount.toString(),
        change: `${activeProductsCount > 0 ? "+" : ""}${activeProductsCount}`,
        icon: Package,
        color: "text-[#C19A6B]",
        bg: "bg-orange-50",
        border: "border-orange-100",
      },
      {
        label: "Clientes Nuevos",
        value: newCustomersCount.toString(),
        change: `+${newCustomersCount}`,
        icon: Users,
        color: "text-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-100",
      },
    ];
  return (
    <div className="space-y-6 sm:space-y-8 p-3 sm:p-6 bg-gray-50 min-h-screen font-sans">

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#154734]" style={{ fontFamily: 'Georgia, serif' }}>Panel de Control</h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">Bienvenido de nuevo, aquí está lo que sucede hoy.</p>
        </div>
        <Link
          href="/admin/productos?action=new"
          className="inline-flex items-center justify-center gap-2 bg-[#154734] hover:bg-[#0f3626] text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95 font-medium text-sm sm:text-base"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </Link>
      </div>

      {/* --- KPI STATS --- */}
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-white rounded-xl sm:rounded-2xl border ${stat.border} p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}
        >
          <div className={`absolute top-0 right-0 w-20 h-20 ${stat.bg} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 opacity-50`} />

          <div className="relative">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className={`p-2 sm:p-3 ${stat.bg} rounded-lg sm:rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>

      {/* --- ACCESOS RÁPIDOS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
        
        {/* Gestionar Productos */}
        <Link
          href="/admin/productos"
          className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#C19A6B] hover:shadow-md transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
             <ArrowUpRight className="w-5 h-5 text-[#C19A6B]" />
          </div>
          <div className="w-12 h-12 bg-[#154734]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Package className="w-6 h-6 text-[#154734]" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-[#154734] transition-colors">Inventario</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Administra tu catálogo, actualiza precios y controla el stock.</p>
        </Link>

        {/* Ver Pedidos */}
        <Link
          href="/admin/pedidos"
          className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
             <ArrowUpRight className="w-5 h-5 text-blue-500" />
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <ClipboardList className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-700 transition-colors">Pedidos</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Revisa órdenes entrantes, estados de envío y detalles de clientes.</p>
        </Link>

        {/* Estadísticas */}
        <Link
          href="/admin/estadisticas"
          className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
             <ArrowUpRight className="w-5 h-5 text-purple-500" />
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-purple-700 transition-colors">Reportes</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Analiza el rendimiento de ventas y métricas clave de tu negocio.</p>
        </Link>
      </div>

      {/* --- ÚLTIMOS PEDIDOS --- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Pedidos Recientes</h2>
            <p className="text-xs sm:text-sm text-gray-500">Últimas transacciones registradas</p>
          </div>
          <Link
            href="/admin/pedidos"
            className="text-xs sm:text-sm font-medium text-[#154734] hover:text-[#0f3626] flex items-center gap-1 hover:underline decoration-[#C19A6B]"
          >
            Ver todos <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">ID Pedido</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4 text-right">Tiempo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => {
                const statusInfo = mapOrderStatus(order.status);
                return (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-[#154734] bg-[#154734]/5 px-2 py-1 rounded">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{order.user?.name || "Cliente Sin Nombre"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">{formatCOP(order.total)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.styleClass}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      {order.paymentMethod || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-400">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(order.createdAt)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="sm:hidden divide-y divide-gray-100">
          {recentOrders.map((order) => {
            const statusInfo = mapOrderStatus(order.status);
            return (
              <div key={order.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#154734] bg-[#154734]/5 px-2 py-1 rounded">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeAgo(order.createdAt)}
                  </span>
                </div>

                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{order.user?.name || "Cliente Sin Nombre"}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <CreditCard className="w-3 h-3" /> {order.paymentMethod || "N/A"}
                    </p>
                  </div>
                  <p className="text-base font-bold text-gray-900">{formatCOP(order.total)}</p>
                </div>

                <div className="flex justify-end">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.styleClass}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error("❌ Error cargando metricas del dashboard:", error);

    return (
      <div className="space-y-6 sm:space-y-8 p-3 sm:p-6 bg-gray-50 min-h-screen font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#154734]" style={{ fontFamily: 'Georgia, serif' }}>Panel de Control</h1>
            <p className="text-gray-500 mt-1 text-xs sm:text-sm">Bienvenido de nuevo, aquí está lo que sucede hoy.</p>
          </div>
          <Link
            href="/admin/productos?action=new"
            className="inline-flex items-center justify-center gap-2 bg-[#154734] hover:bg-[#0f3626] text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95 font-medium text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </Link>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-bold text-red-900 mb-2">Error al cargar métricas</h3>
          <p className="text-xs sm:text-sm text-red-700">
            Hubo un problema al conectar con la base de datos. Por favor, intenta recargar la página.
          </p>
        </div>
      </div>
    );
  }
}
