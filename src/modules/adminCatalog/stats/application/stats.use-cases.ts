import { prisma } from "@/lib/prisma";
import type {
  CancellationData,
  CategorySale,
  ColorSale,
  DailySale,
  DeliveryTimeData,
  DiscountData,
  FunnelItem,
  GeographyData,
  PeakHourData,
  PaymentMethodSale,
  Period,
  RetentionData,
  ReviewsData,
  SalesPeriodData,
  SizeSale,
  StockAlert,
  TopProduct,
} from "../contracts/stats.dto";
import {
  buildDeliveredOrderWhere,
  buildRevenueOrderItemWhere,
  buildRevenueOrderWhere,
  REVENUE_ORDER_STATUSES,
} from "../domain/stats-order-filters";
import {
  calculatePercentageChange,
  getPeriodDateRange,
  toColombiaDate,
  toDayLabel,
} from "../domain/stats-period";

const CATEGORY_COLORS = ["bg-[#154734]", "bg-[#C19A6B]", "bg-[#0f2e22]", "bg-[#e5d0b1]", "bg-gray-400"] as const;

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);

const PAYMENT_LABELS: Record<string, string> = {
  BOLD: "Bold",
  ADDI: "Addi",
  NEQUI: "Nequi",
  BANCOLOMBIA: "Bancolombia",
  DAVIPLATA: "Daviplata",
};

const FUNNEL_CONFIG: Record<string, { label: string; color: string; actionable: boolean; order: number }> = {
  PENDING: { label: "Pendientes", color: "yellow", actionable: true, order: 1 },
  PROCESSING: { label: "Procesando", color: "blue", actionable: true, order: 2 },
  PAID: { label: "Por Enviar", color: "indigo", actionable: true, order: 3 },
  SHIPPED: { label: "En Camino", color: "purple", actionable: false, order: 4 },
  DELIVERED: { label: "Entregados", color: "green", actionable: false, order: 5 },
  CANCELLED: { label: "Cancelados", color: "red", actionable: false, order: 6 },
  FAILED: { label: "Fallidos", color: "rose", actionable: false, order: 7 },
  REFUNDED: { label: "Reembolsados", color: "gray", actionable: false, order: 8 },
};

export async function getStatsByPeriod(period: Period): Promise<SalesPeriodData> {
  const { start, end, durationMs } = getPeriodDateRange(period);
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(start.getTime() - durationMs);

  const [ordersInPeriod, prevOrders, newCustomers] = await Promise.all([
    prisma.order.findMany({ where: buildRevenueOrderWhere(start, end), select: { total: true } }),
    prisma.order.findMany({
      where: buildRevenueOrderWhere(prevStart, prevEnd),
      select: { total: true },
    }),
    prisma.user.count({ where: { role: "USER", createdAt: { gte: start, lte: end } } }),
  ]);

  const totalRevenue = ordersInPeriod.reduce((sum, o) => sum + Number(o.total), 0);
  const orderCount = ordersInPeriod.length;
  const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0;
  const previousRevenue = prevOrders.reduce((sum, o) => sum + Number(o.total), 0);
  return { total: formatPrice(totalRevenue), orders: orderCount, avgTicket: formatPrice(avgTicket), newCustomers, change: calculatePercentageChange(totalRevenue, previousRevenue) };
}

export async function getTopProductsByPeriod(period: Period, limit = 8): Promise<TopProduct[]> {
  const { start, end, durationMs } = getPeriodDateRange(period);
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(start.getTime() - durationMs);

  const [currentItems, prevItems] = await Promise.all([
    prisma.orderItem.findMany({
      where: buildRevenueOrderItemWhere(start, end),
      select: { productId: true, name: true, quantity: true, total: true },
    }),
    prisma.orderItem.findMany({
      where: buildRevenueOrderItemWhere(prevStart, prevEnd),
      select: { productId: true, quantity: true },
    }),
  ]);

  const currentMap = new Map<string, { name: string; quantity: number; total: number }>();
  for (const item of currentItems) {
    const entry = currentMap.get(item.productId) ?? { name: item.name, quantity: 0, total: 0 };
    entry.quantity += item.quantity;
    entry.total += Number(item.total);
    currentMap.set(item.productId, entry);
  }

  const prevMap = new Map<string, number>();
  for (const item of prevItems) prevMap.set(item.productId, (prevMap.get(item.productId) ?? 0) + item.quantity);

  return Array.from(currentMap.entries())
    .sort(([, a], [, b]) => b.quantity - a.quantity)
    .slice(0, limit)
    .map(([id, product]) => ({ name: product.name, sold: product.quantity, revenue: formatPrice(product.total), trend: calculatePercentageChange(product.quantity, prevMap.get(id) ?? 0) }));
}

export async function getDailySalesByPeriod(period: Period): Promise<DailySale[]> {
  const { start, end } = getPeriodDateRange(period);
  const orders = await prisma.order.findMany({
    where: buildRevenueOrderWhere(start, end),
    select: { total: true, createdAt: true },
  });
  const dailyMap = new Map<string, number>();
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = toDayLabel(cursor);
    dailyMap.set(key, 0);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  for (const order of orders) {
    const key = toDayLabel(order.createdAt);
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + Number(order.total));
  }
  return Array.from(dailyMap.entries()).map(([key, amount]) => ({ day: key.split("-")[1], amount }));
}

export async function getCategorySalesByPeriod(period: Period): Promise<CategorySale[]> {
  const { start, end, durationMs } = getPeriodDateRange(period);
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(start.getTime() - durationMs);
  const [currentItems, prevItems] = await Promise.all([
    prisma.orderItem.findMany({
      where: buildRevenueOrderItemWhere(start, end),
      select: { total: true, productId: true, quantity: true, orderId: true, name: true },
    }),
    prisma.orderItem.findMany({
      where: buildRevenueOrderItemWhere(prevStart, prevEnd),
      select: { total: true, productId: true },
    }),
  ]);
  if (currentItems.length === 0) return [];
  const totalRevenue = currentItems.reduce((sum, i) => sum + Number(i.total), 0);
  if (totalRevenue === 0) return [];
  const allProductIds = [...new Set([...currentItems.map((i) => i.productId), ...prevItems.map((i) => i.productId)])];
  const products = await prisma.product.findMany({
    where: { id: { in: allProductIds } },
    select: {
      id: true,
      categories: {
        select: {
          category: { select: { id: true, name: true } },
        },
      },
    },
  });
  const productCatMap = new Map(
    products.map((p) => [
      p.id,
      p.categories.map((link) => ({ id: link.category.id, name: link.category.name })),
    ])
  );
  const categoryIds = [
    ...new Set(
      currentItems.flatMap((item) =>
        (productCatMap.get(item.productId) ?? []).map((category) => category.id)
      )
    ),
  ];
  const activeCountsRaw = await prisma.productCategory.groupBy({
    by: ["categoryId"],
    where: {
      categoryId: { in: categoryIds },
      product: { status: "ACTIVE" },
    },
    _count: { productId: true },
  });
  const activeMap = new Map(activeCountsRaw.map((r) => [r.categoryId, r._count.productId]));
  const prevRevMap = new Map<string, number>();
  for (const item of prevItems) {
    for (const cat of productCatMap.get(item.productId) ?? []) {
      prevRevMap.set(cat.id, (prevRevMap.get(cat.id) ?? 0) + Number(item.total));
    }
  }

  type CatAgg = { name: string; revenue: number; units: number; orderIds: Set<string>; productUnits: Map<string, { name: string; units: number }> };
  const catMap = new Map<string, CatAgg>();
  for (const item of currentItems) {
    const productCategories = productCatMap.get(item.productId) ?? [];
    if (productCategories.length === 0) continue;
    for (const cat of productCategories) {
      const entry: CatAgg = catMap.get(cat.id) ?? { name: cat.name, revenue: 0, units: 0, orderIds: new Set(), productUnits: new Map() };
      entry.revenue += Number(item.total);
      entry.units += item.quantity;
      entry.orderIds.add(item.orderId);
      const prod = entry.productUnits.get(item.productId) ?? { name: item.name, units: 0 };
      prod.units += item.quantity;
      entry.productUnits.set(item.productId, prod);
      catMap.set(cat.id, entry);
    }
  }

  return Array.from(catMap.entries())
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .map(([catId, cat], idx) => {
      const orders = cat.orderIds.size;
      const topProduct = Array.from(cat.productUnits.values()).sort((a, b) => b.units - a.units)[0];
      return {
        name: cat.name,
        percentage: Math.round((cat.revenue / totalRevenue) * 100),
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
        revenue: formatPrice(cat.revenue),
        units: cat.units,
        orders,
        avgTicket: formatPrice(orders > 0 ? cat.revenue / orders : 0),
        topProduct: topProduct?.name ?? "-",
        topProductUnits: topProduct?.units ?? 0,
        activeProducts: activeMap.get(catId) ?? 0,
        trend: calculatePercentageChange(cat.revenue, prevRevMap.get(catId) ?? 0),
      };
    });
}

export async function getSizesSalesByPeriod(period: Period): Promise<SizeSale[]> {
  const { start, end, durationMs } = getPeriodDateRange(period);
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(start.getTime() - durationMs);
  const [currentItems, prevItems] = await Promise.all([
    prisma.orderItem.findMany({
      where: buildRevenueOrderItemWhere(start, end),
      select: { size: true, quantity: true },
    }),
    prisma.orderItem.findMany({
      where: buildRevenueOrderItemWhere(prevStart, prevEnd),
      select: { size: true, quantity: true },
    }),
  ]);
  if (currentItems.length === 0) return [];
  const sizeMap = new Map<string, number>();
  for (const item of currentItems) sizeMap.set(item.size, (sizeMap.get(item.size) ?? 0) + item.quantity);
  const prevSizeMap = new Map<string, number>();
  for (const item of prevItems) prevSizeMap.set(item.size, (prevSizeMap.get(item.size) ?? 0) + item.quantity);
  const totalUnits = Array.from(sizeMap.values()).reduce((a, b) => a + b, 0);
  if (totalUnits === 0) return [];
  return Array.from(sizeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([size, units]) => ({ size: size === "ONESIZE" ? "Talla Unica" : size, units, percentage: Math.round((units / totalUnits) * 100), trend: calculatePercentageChange(units, prevSizeMap.get(size) ?? 0) }));
}

export async function getColorsSalesByPeriod(period: Period): Promise<ColorSale[]> {
  const { start, end, durationMs } = getPeriodDateRange(period);
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(start.getTime() - durationMs);
  const [currentItems, prevItems] = await Promise.all([
    prisma.orderItem.findMany({
      where: buildRevenueOrderItemWhere(start, end),
      select: { colorName: true, quantity: true },
    }),
    prisma.orderItem.findMany({
      where: buildRevenueOrderItemWhere(prevStart, prevEnd),
      select: { colorName: true, quantity: true },
    }),
  ]);
  if (currentItems.length === 0) return [];
  const colorMap = new Map<string, number>();
  for (const item of currentItems) colorMap.set(item.colorName, (colorMap.get(item.colorName) ?? 0) + item.quantity);
  const prevColorMap = new Map<string, number>();
  for (const item of prevItems) prevColorMap.set(item.colorName, (prevColorMap.get(item.colorName) ?? 0) + item.quantity);
  const totalUnits = Array.from(colorMap.values()).reduce((a, b) => a + b, 0);
  if (totalUnits === 0) return [];
  return Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([colorName, units]) => ({ colorName, units, percentage: Math.round((units / totalUnits) * 100), trend: calculatePercentageChange(units, prevColorMap.get(colorName) ?? 0) }));
}

export async function getPaymentMethodsByPeriod(period: Period): Promise<PaymentMethodSale[]> {
  const { start, end } = getPeriodDateRange(period);
  const orders = await prisma.order.findMany({
    where: buildRevenueOrderWhere(start, end),
    select: { paymentMethod: true, total: true },
  });
  if (orders.length === 0) return [];
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const methodMap = new Map<string, { orders: number; revenue: number }>();
  for (const order of orders) {
    const entry = methodMap.get(order.paymentMethod) ?? { orders: 0, revenue: 0 };
    entry.orders++;
    entry.revenue += Number(order.total);
    methodMap.set(order.paymentMethod, entry);
  }
  return Array.from(methodMap.entries())
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .map(([method, data]) => ({ method, label: PAYMENT_LABELS[method] ?? method, orders: data.orders, revenue: formatPrice(data.revenue), percentage: Math.round((data.revenue / totalRevenue) * 100) }));
}

export async function getGeographyByPeriod(period: Period): Promise<GeographyData> {
  const { start, end } = getPeriodDateRange(period);
  const orders = await prisma.order.findMany({
    where: buildRevenueOrderWhere(start, end),
    select: { shippingDepartment: true, shippingCity: true, total: true },
  });
  if (orders.length === 0) return { departments: [], cities: [], totalOrders: 0 };
  const deptMap = new Map<string, { orders: number; revenue: number }>();
  const cityMap = new Map<string, { orders: number; revenue: number }>();
  for (const order of orders) {
    const d = deptMap.get(order.shippingDepartment) ?? { orders: 0, revenue: 0 };
    d.orders++;
    d.revenue += Number(order.total);
    deptMap.set(order.shippingDepartment, d);
    const c = cityMap.get(order.shippingCity) ?? { orders: 0, revenue: 0 };
    c.orders++;
    c.revenue += Number(order.total);
    cityMap.set(order.shippingCity, c);
  }
  const toSorted = (map: Map<string, { orders: number; revenue: number }>, limit: number) =>
    Array.from(map.entries())
      .sort(([, a], [, b]) => b.orders - a.orders)
      .slice(0, limit)
      .map(([name, data]) => ({ name, orders: data.orders, revenue: formatPrice(data.revenue), percentage: Math.round((data.orders / orders.length) * 100) }));
  return { departments: toSorted(deptMap, 6), cities: toSorted(cityMap, 6), totalOrders: orders.length };
}

export async function getRetentionByPeriod(period: Period): Promise<RetentionData> {
  const { start, end } = getPeriodDateRange(period);
  const periodOrders = await prisma.order.findMany({
    where: buildRevenueOrderWhere(start, end),
    select: { userId: true },
    distinct: ["userId"],
  });
  if (periodOrders.length === 0) return { returning: 0, newBuyers: 0, returningPercentage: 0, totalBuyers: 0 };
  const userIds = periodOrders.map((o) => o.userId);
  const returningUsers = await prisma.order.findMany({
    where: {
      userId: { in: userIds },
      status: { in: [...REVENUE_ORDER_STATUSES] },
      createdAt: { lt: start },
    },
    select: { userId: true },
    distinct: ["userId"],
  });
  const returning = returningUsers.length;
  const total = periodOrders.length;
  return { returning, newBuyers: total - returning, returningPercentage: total > 0 ? Math.round((returning / total) * 100) : 0, totalBuyers: total };
}

export async function getDiscountImpactByPeriod(period: Period): Promise<DiscountData> {
  const { start, end } = getPeriodDateRange(period);
  const [orders, couponsUsed] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...buildRevenueOrderWhere(start, end),
        discount: { gt: 0 },
      },
      select: { discount: true, total: true },
    }),
    prisma.coupon.count({ where: { isUsed: true, usedAt: { gte: start, lte: end } } }),
  ]);
  const totalDiscount = orders.reduce((sum, o) => sum + Number(o.discount), 0);
  const grossRevenue = orders.reduce((sum, o) => sum + Number(o.total) + Number(o.discount), 0);
  return { totalDiscount: formatPrice(totalDiscount), discountedOrders: orders.length, couponsUsed, percentageOfRevenue: grossRevenue > 0 ? `${Math.round((totalDiscount / grossRevenue) * 100)}%` : "0%" };
}

export async function getCancellationRateByPeriod(period: Period): Promise<CancellationData> {
  const { start, end } = getPeriodDateRange(period);
  const [total, cancelled, lostAgg] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.order.count({ where: { status: "CANCELLED", createdAt: { gte: start, lte: end } } }),
    prisma.order.aggregate({ where: { status: "CANCELLED", createdAt: { gte: start, lte: end } }, _sum: { total: true } }),
  ]);
  return { cancelled, total, rate: total > 0 ? `${Math.round((cancelled / total) * 100)}%` : "0%", lostRevenue: formatPrice(Number(lostAgg._sum.total ?? 0)) };
}

export async function getReviewsByPeriod(period: Period): Promise<ReviewsData> {
  const { start, end } = getPeriodDateRange(period);
  const reviews = await prisma.review.findMany({ where: { createdAt: { gte: start, lte: end } }, select: { rating: true } });
  if (reviews.length === 0) return { newReviews: 0, avgRating: 0, distribution: [] };
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return {
    newReviews: reviews.length,
    avgRating: Math.round(avg * 10) / 10,
    distribution: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: reviews.filter((r) => r.rating === stars).length })),
  };
}

export async function getAvgDeliveryTime(period: Period): Promise<DeliveryTimeData> {
  const { start, end } = getPeriodDateRange(period);
  const orders = await prisma.order.findMany({
    where: {
      ...buildDeliveredOrderWhere(start, end),
      paidAt: { not: null },
      deliveredAt: { not: null },
    },
    select: { paidAt: true, deliveredAt: true },
  });
  if (orders.length === 0) return { avgDays: 0, minDays: 0, maxDays: 0, count: 0 };
  const diffs = orders.map((o) => (new Date(o.deliveredAt!).getTime() - new Date(o.paidAt!).getTime()) / (1000 * 60 * 60 * 24));
  return {
    avgDays: Math.round((diffs.reduce((a, b) => a + b, 0) / diffs.length) * 10) / 10,
    minDays: Math.round(Math.min(...diffs) * 10) / 10,
    maxDays: Math.round(Math.max(...diffs) * 10) / 10,
    count: orders.length,
  };
}

export async function getPeakHoursByPeriod(period: Period): Promise<PeakHourData[]> {
  const { start, end } = getPeriodDateRange(period);
  const orders = await prisma.order.findMany({
    where: buildRevenueOrderWhere(start, end),
    select: { createdAt: true },
  });
  if (orders.length === 0) return [];
  const hourMap = new Map<number, number>();
  for (let h = 0; h < 24; h++) hourMap.set(h, 0);
  for (const order of orders) {
    const localDate = toColombiaDate(order.createdAt);
    const hour = localDate.getUTCHours();
    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
  }
  const maxCount = Math.max(...hourMap.values(), 1);
  return Array.from(hourMap.entries()).map(([hour, count]) => ({
    hour,
    label: `${hour.toString().padStart(2, "0")}:00`,
    orders: count,
    percentage: Math.round((count / maxCount) * 100),
  }));
}

export async function getOrdersFunnel(): Promise<FunnelItem[]> {
  const counts = await prisma.order.groupBy({ by: ["status"], _count: { id: true }, _sum: { total: true } });
  return counts
    .map((c) => ({
      status: c.status,
      label: FUNNEL_CONFIG[c.status]?.label ?? c.status,
      count: c._count.id,
      revenue: formatPrice(Number(c._sum.total ?? 0)),
      color: FUNNEL_CONFIG[c.status]?.color ?? "gray",
      actionable: FUNNEL_CONFIG[c.status]?.actionable ?? false,
      order: FUNNEL_CONFIG[c.status]?.order ?? 99,
    }))
    .sort((a, b) => a.order - b.order);
}

export async function getLowStockAlerts(limit = 10): Promise<StockAlert[]> {
  const candidates = await prisma.productVariant.findMany({
    where: { isActive: true, stock: { lte: 5 } },
    select: { stock: true, minStock: true, size: true, sku: true, color: { select: { name: true, product: { select: { name: true } } } } },
    orderBy: { stock: "asc" },
    take: limit * 2,
  });

  return candidates
    .filter((v) => v.stock <= v.minStock)
    .slice(0, limit)
    .map((v) => ({
      productName: v.color.product.name,
      colorName: v.color.name,
      size: v.size === "ONESIZE" ? "Unica" : v.size,
      sku: v.sku,
      stock: v.stock,
      minStock: v.minStock,
    }));
}
