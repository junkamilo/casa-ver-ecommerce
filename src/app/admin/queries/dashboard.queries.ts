import { DollarSign, ShoppingCart, Package, Users, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "../constants";
import type { DashboardData, RecentOrder, StatItem } from "../types";

// --- Helpers de rango de fechas (privados a este módulo) ---
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

// --- Query principal del dashboard ---
// Ejecuta todas las consultas en paralelo con Promise.all para máximo rendimiento
export async function fetchDashboardData(): Promise<DashboardData> {
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

  const stats: StatItem[] = [
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
    {
      label: "Early Bird",
      value: `${earlyBirdCount}/${EARLY_BIRD_LIMIT}`,
      change: earlyBirdCount >= EARLY_BIRD_LIMIT ? "Agotado" : `${EARLY_BIRD_LIMIT - earlyBirdCount} libres`,
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      changeBg: earlyBirdCount >= EARLY_BIRD_LIMIT ? "bg-red-50" : "bg-amber-50",
      changeColor: earlyBirdCount >= EARLY_BIRD_LIMIT ? "text-red-600" : "text-amber-600",
    },
  ];

  // Prisma retorna Decimal para `total` — normalizamos a number para serialización segura
  const recentOrders: RecentOrder[] = rawOrders.map((o) => ({
    ...o,
    total: Number(o.total),
  }));

  return { stats, recentOrders };
}
