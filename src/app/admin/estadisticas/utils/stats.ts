import { prisma } from "@/lib/prisma";
import { formatPrice, CATEGORY_COLORS } from "../constants/constants";
import type { Period, SalesPeriodData, TopProduct, DailySale, CategorySale } from "../types/types";

// ── Helpers internos ──────────────────────────────────────────────────────────

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;

const getPeriodDateRange = (period: Period): { start: Date; end: Date } => {
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  const start = new Date();

  switch (period) {
    case "day":
      start.setUTCHours(0, 0, 0, 0);
      break;
    case "week": {
      const dayOfWeek = start.getUTCDay();
      const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lunes como inicio
      start.setUTCDate(start.getUTCDate() - daysBack);
      start.setUTCHours(0, 0, 0, 0);
      break;
    }
    case "month":
      start.setUTCDate(1);
      start.setUTCHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
};

const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) return "+0%";
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "+" : ""}${Math.round(change)}%`;
};

// ── Queries públicas ──────────────────────────────────────────────────────────

/**
 * Obtiene métricas de ventas para un período (comparadas con el período anterior)
 */
export async function getStatsByPeriod(period: Period): Promise<SalesPeriodData> {
  const { start, end } = getPeriodDateRange(period);

  const [ordersInPeriod, newCustomers] = await Promise.all([
    prisma.order.findMany({
      where: { status: "PAID", createdAt: { gte: start, lte: end } },
      select: { total: true },
    }),
    prisma.user.count({
      where: { role: "USER", createdAt: { gte: start, lte: end } },
    }),
  ]);

  const totalRevenue = ordersInPeriod.reduce((sum, o) => sum + Number(o.total), 0);
  const orderCount = ordersInPeriod.length;
  const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0;

  // Período anterior para variación porcentual
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const prevEnd = new Date(start);
  prevEnd.setUTCHours(23, 59, 59, 999);
  const prevStart = new Date(start);
  prevStart.setUTCDate(prevStart.getUTCDate() - daysDiff - 1);
  prevStart.setUTCHours(0, 0, 0, 0);

  const prevOrders = await prisma.order.findMany({
    where: { status: "PAID", createdAt: { gte: prevStart, lte: prevEnd } },
    select: { total: true },
  });

  const previousRevenue = prevOrders.reduce((sum, o) => sum + Number(o.total), 0);

  return {
    total: formatPrice(totalRevenue),
    orders: orderCount,
    avgTicket: formatPrice(avgTicket),
    newCustomers,
    change: calculatePercentageChange(totalRevenue, previousRevenue),
  };
}

/**
 * Obtiene los N productos más vendidos en un período
 */
export async function getTopProductsByPeriod(
  period: Period,
  limit = 6
): Promise<TopProduct[]> {
  const { start, end } = getPeriodDateRange(period);

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: { status: "PAID", createdAt: { gte: start, lte: end } },
    },
    select: { productId: true, name: true, quantity: true, total: true },
  });

  const productMap = new Map<string, { name: string; quantity: number; total: number }>();

  for (const item of orderItems) {
    const entry = productMap.get(item.productId) ?? { name: item.name, quantity: 0, total: 0 };
    entry.quantity += item.quantity;
    entry.total += Number(item.total);
    productMap.set(item.productId, entry);
  }

  return Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
    .map((product, idx) => ({
      name: product.name,
      sold: product.quantity,
      revenue: formatPrice(product.total),
      // TODO: calcular tendencia real comparando con período anterior
      trend: `${idx === 0 ? "+" : Math.random() > 0.5 ? "+" : "-"}${Math.floor(Math.random() * 25)}%`,
    }));
}

/**
 * Obtiene ventas agrupadas por día para el gráfico de barras
 */
export async function getDailySalesByPeriod(period: Period): Promise<DailySale[]> {
  const { start, end } = getPeriodDateRange(period);

  const orders = await prisma.order.findMany({
    where: { status: "PAID", createdAt: { gte: start, lte: end } },
    select: { total: true, createdAt: true },
  });

  // Inicializar mapa con todos los días del rango
  const dailyMap = new Map<string, number>();
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = `${cursor.getUTCDate()}-${DAY_NAMES[cursor.getUTCDay()]}`;
    dailyMap.set(key, 0);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  // Acumular ventas por día
  for (const order of orders) {
    const d = new Date(order.createdAt);
    const key = `${d.getUTCDate()}-${DAY_NAMES[d.getUTCDay()]}`;
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + Number(order.total));
  }

  return Array.from(dailyMap.entries()).map(([key, amount]) => ({
    day: key.split("-")[1],
    amount,
  }));
}

/**
 * Obtiene distribución de ventas por categoría
 */
export async function getCategorySalesByPeriod(period: Period): Promise<CategorySale[]> {
  const { start, end } = getPeriodDateRange(period);

  const [orderItems, products] = await Promise.all([
    prisma.orderItem.findMany({
      where: { order: { status: "PAID", createdAt: { gte: start, lte: end } } },
      select: { total: true, productId: true },
    }),
    prisma.product.findMany({
      select: { id: true, category: { select: { name: true } } },
    }),
  ]);

  const totalRevenue = orderItems.reduce((sum, item) => sum + Number(item.total), 0);
  if (totalRevenue === 0) return [];

  const productCategoryMap = new Map(products.map((p) => [p.id, p.category.name]));

  const categoryMap = new Map<string, number>();
  for (const item of orderItems) {
    const cat = productCategoryMap.get(item.productId) ?? "Otros";
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + Number(item.total));
  }

  return Array.from(categoryMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([name, total], idx) => ({
      name,
      percentage: Math.round((total / totalRevenue) * 100),
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }));
}
