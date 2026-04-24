import { prisma } from "@/lib/prisma";
import type { DashboardDataDTO, DashboardRecentOrderDTO, DashboardStatDTO } from "../contracts/dashboard.dto";

const formatCOP = (amount: number | bigint | string): string => {
  const num = Number(amount);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const getTodayRange = () => {
  const startDate = new Date();
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setUTCHours(23, 59, 59, 999);
  return { startDate, endDate };
};

const getLast30DaysStart = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
};

export async function fetchDashboardDataUseCase(): Promise<DashboardDataDTO> {
  const { startDate: todayStart, endDate: todayEnd } = getTodayRange();
  const thirtyDaysAgo = getLast30DaysStart();
  const EARLY_BIRD_LIMIT = 10;

  const [salesResult, todayOrdersCount, activeProductsCount, newCustomersCount, earlyBirdCount, rawOrders] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: "PAID", createdAt: { gte: todayStart, lte: todayEnd } },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.product.count({
        where: { status: "ACTIVE" },
      }),
      prisma.user.count({
        where: { role: "USER", createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.user.count({
        where: { earlyBirdDiscount: true },
      }),
      prisma.order.findMany({
        where: { status: "PAID" },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
          paymentMethod: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const todaySales = salesResult._sum.total ? Number(salesResult._sum.total) : 0;

  const stats: DashboardStatDTO[] = [
    {
      label: "Ventas Hoy",
      value: formatCOP(todaySales),
      change: "+0%",
      icon: "dollar",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Pedidos Hoy",
      value: todayOrdersCount.toString(),
      change: `${todayOrdersCount > 0 ? "+" : ""}${todayOrdersCount}`,
      icon: "cart",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Productos Activos",
      value: activeProductsCount.toString(),
      change: `${activeProductsCount > 0 ? "+" : ""}${activeProductsCount}`,
      icon: "package",
      color: "text-[#C19A6B]",
      bg: "bg-orange-50",
      border: "border-orange-100",
    },
    {
      label: "Clientes Nuevos",
      value: newCustomersCount.toString(),
      change: `+${newCustomersCount}`,
      icon: "users",
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
    {
      label: "Early Bird",
      value: `${earlyBirdCount}/${EARLY_BIRD_LIMIT}`,
      change: earlyBirdCount >= EARLY_BIRD_LIMIT ? "Agotado" : `${EARLY_BIRD_LIMIT - earlyBirdCount} libres`,
      icon: "star",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      changeBg: earlyBirdCount >= EARLY_BIRD_LIMIT ? "bg-red-50" : "bg-amber-50",
      changeColor: earlyBirdCount >= EARLY_BIRD_LIMIT ? "text-red-600" : "text-amber-600",
    },
  ];

  const recentOrders: DashboardRecentOrderDTO[] = rawOrders.map((order) => ({
    ...order,
    total: Number(order.total),
  }));

  return { stats, recentOrders };
}
