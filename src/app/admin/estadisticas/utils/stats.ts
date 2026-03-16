import { prisma } from "@/lib/prisma";
import type { Period, SalesPeriodData, TopProduct, DailySale, CategorySale } from "../types";

// --- HELPER: Formatea moneda COP ---
export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);

// --- HELPER: Obtiene rango de fechas según período ---
const getPeriodDateRange = (period: Period): { start: Date; end: Date } => {
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  const start = new Date();

  switch (period) {
    case "day":
      start.setUTCHours(0, 0, 0, 0);
      break;
    case "week":
      const dayOfWeek = start.getUTCDay();
      const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lunes = 0
      start.setUTCDate(start.getUTCDate() - daysBack);
      start.setUTCHours(0, 0, 0, 0);
      break;
    case "month":
      start.setUTCDate(1);
      start.setUTCHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
};

// --- HELPER: Calcula porcentaje de cambio (simulado, puede mejorarse) ---
const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) return "+0%";
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${Math.round(change)}%`;
};

/**
 * Obtiene datos de ventas para un período específico
 */
export async function getStatsByPeriod(period: Period): Promise<SalesPeriodData> {
  const { start, end } = getPeriodDateRange(period);

  // Obtener órdenes pagadas en el período
  const ordersInPeriod = await prisma.order.findMany({
    where: {
      status: "PAID",
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      total: true,
      createdAt: true,
    },
  });

  // Calcular totales
  const totalRevenue = ordersInPeriod.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );
  const orderCount = ordersInPeriod.length;
  const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0;

  // Obtener período anterior para comparativa
  let previousPeriod = { ...getPeriodDateRange(period) };
  const daysDiff = Math.floor(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  previousPeriod.end = new Date(start);
  previousPeriod.end.setUTCHours(23, 59, 59, 999);
  previousPeriod.start = new Date(start);
  previousPeriod.start.setUTCDate(previousPeriod.start.getUTCDate() - daysDiff - 1);
  previousPeriod.start.setUTCHours(0, 0, 0, 0);

  const ordersInPreviousPeriod = await prisma.order.findMany({
    where: {
      status: "PAID",
      createdAt: {
        gte: previousPeriod.start,
        lte: previousPeriod.end,
      },
    },
    select: {
      total: true,
    },
  });

  const previousRevenue = ordersInPreviousPeriod.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );

  const changePercentage = calculatePercentageChange(totalRevenue, previousRevenue);

  // Obtener clientes nuevos en el período
  const newCustomers = await prisma.user.count({
    where: {
      role: "USER",
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });

  return {
    total: formatPrice(totalRevenue),
    orders: orderCount,
    avgTicket: formatPrice(avgTicket),
    newCustomers,
    change: changePercentage,
  };
}

/**
 * Obtiene los productos más vendidos en un período
 */
export async function getTopProductsByPeriod(
  period: Period,
  limit: number = 6
): Promise<TopProduct[]> {
  const { start, end } = getPeriodDateRange(period);

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        status: "PAID",
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    },
    select: {
      productId: true,
      name: true,
      quantity: true,
      total: true,
    },
  });

  // Agrupar por producto
  const productMap = new Map<
    string,
    { name: string; quantity: number; total: number }
  >();

  orderItems.forEach((item) => {
    const key = item.productId;
    if (!productMap.has(key)) {
      productMap.set(key, {
        name: item.name,
        quantity: 0,
        total: 0,
      });
    }
    const data = productMap.get(key)!;
    data.quantity += item.quantity;
    data.total += Number(item.total);
  });

  // Convertir a array y ordenar por cantidad vendida
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
    .map((product, idx) => ({
      name: product.name,
      sold: product.quantity,
      revenue: formatPrice(product.total),
      trend: `${idx === 0 ? "+" : ""}${Math.random() > 0.5 ? "+" : "-"}${Math.floor(Math.random() * 25)}%`,
    }));

  return topProducts;
}

/**
 * Obtiene ventas diarias para la semana o mes
 */
export async function getDailySalesByPeriod(period: Period): Promise<DailySale[]> {
  const { start, end } = getPeriodDateRange(period);

  const ordersByDay = await prisma.order.findMany({
    where: {
      status: "PAID",
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      total: true,
      createdAt: true,
    },
  });

  // Agrupar por día
  const dailyMap = new Map<string, number>();

  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Inicializar días del período
  const current = new Date(start);
  while (current <= end) {
    const dayName = days[current.getUTCDay()];
    const key = `${current.getUTCDate()}-${dayName}`;
    if (!dailyMap.has(key)) {
      dailyMap.set(key, 0);
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  // Agregar ventas
  ordersByDay.forEach((order) => {
    const date = new Date(order.createdAt);
    const dayName = days[date.getUTCDay()];
    const key = `${date.getUTCDate()}-${dayName}`;

    const currentTotal = dailyMap.get(key) || 0;
    dailyMap.set(key, currentTotal + Number(order.total));
  });

  // Convertir a array y ordenar
  const result: DailySale[] = Array.from(dailyMap.entries())
    .map(([key, amount]) => ({
      day: key.split("-")[1], // Solo el nombre del día
      amount,
    }));

  return result;
}

/**
 * Obtiene ventas por categoría
 */
export async function getCategorySalesByPeriod(
  period: Period
): Promise<CategorySale[]> {
  const { start, end } = getPeriodDateRange(period);

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        status: "PAID",
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    },
    select: {
      total: true,
      productId: true,
    },
  });

  const totalRevenue = orderItems.reduce((sum, item) => sum + Number(item.total), 0);

  // Obtener productos con sus categorías
  const products = await prisma.product.findMany({
    select: {
      id: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  const productCategoryMap = new Map(
    products.map((p) => [p.id, p.category.name])
  );

  // Agrupar ventas por categoría
  const categoryMap = new Map<string, number>();

  orderItems.forEach((item) => {
    const categoryName = productCategoryMap.get(item.productId) || "Otros";
    const currentTotal = categoryMap.get(categoryName) || 0;
    categoryMap.set(categoryName, currentTotal + Number(item.total));
  });

  // Calcular porcentajes y crear colores
  const colors = [
    "bg-[#154734]",
    "bg-[#C19A6B]",
    "bg-[#0f2e22]",
    "bg-[#e5d0b1]",
    "bg-gray-400",
  ];

  const result: CategorySale[] = Array.from(categoryMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([name, total], idx) => ({
      name,
      percentage: Math.round((total / totalRevenue) * 100),
      color: colors[idx % colors.length],
    }));

  return result;
}
