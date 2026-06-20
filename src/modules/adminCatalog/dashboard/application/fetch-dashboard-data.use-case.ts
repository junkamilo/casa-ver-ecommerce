import { prisma } from "@/lib/prisma";
import type {
  DashboardDataDTO,
  DashboardIncidentItemDTO,
  DashboardPaymentIncidentsDTO,
  DashboardRecentOrderDTO,
  DashboardStatDTO,
} from "../contracts/dashboard.dto";
import { buildSlaQueueItem, sortSlaQueue } from "../domain/dashboard-sla";

const INCIDENT_WINDOW_MINUTES = 60;
const SLA_QUEUE_LIMIT = 12;
const RECENT_INCIDENTS_LIMIT = 8;

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

function isWebhookError(status: number, errorMessage: string | null): boolean {
  return status >= 400 || Boolean(errorMessage?.trim());
}

function buildPaymentIncidentsFromLogs(
  logs: {
    id: string;
    provider: string;
    eventType: string | null;
    status: number;
    errorMessage: string | null;
    createdAt: Date;
    orderId: string | null;
  }[]
): DashboardPaymentIncidentsDTO {
  const providerMap = new Map<string, { total: number; errors: number }>();
  let errorCount = 0;

  for (const log of logs) {
    const entry = providerMap.get(log.provider) ?? { total: 0, errors: 0 };
    entry.total += 1;
    if (isWebhookError(log.status, log.errorMessage)) {
      entry.errors += 1;
      errorCount += 1;
    }
    providerMap.set(log.provider, entry);
  }

  const byProvider = Array.from(providerMap.entries())
    .map(([provider, data]) => ({ provider, ...data }))
    .sort((a, b) => b.errors - a.errors || b.total - a.total);

  const recent: DashboardIncidentItemDTO[] = logs
    .filter((log) => isWebhookError(log.status, log.errorMessage))
    .slice(0, RECENT_INCIDENTS_LIMIT)
    .map((log) => ({
      id: log.id,
      provider: log.provider,
      eventType: log.eventType,
      status: log.status,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt,
      orderId: log.orderId,
    }));

  return {
    windowMinutes: INCIDENT_WINDOW_MINUTES,
    totalEvents: logs.length,
    errorCount,
    byProvider,
    recent,
  };
}

export async function fetchDashboardDataUseCase(): Promise<DashboardDataDTO> {
  const now = new Date();
  const incidentWindowStart = new Date(now.getTime() - INCIDENT_WINDOW_MINUTES * 60_000);
  const { startDate: todayStart, endDate: todayEnd } = getTodayRange();
  const thirtyDaysAgo = getLast30DaysStart();

  const [
    salesResult,
    todayOrdersCount,
    activeProductsCount,
    newCustomersCount,
    rawOrders,
    slaCandidates,
    pendingReviews,
    unreadNotifications,
    pendingOrders,
    paidAwaitingFulfillment,
    processingOrders,
    webhookLogs,
  ] = await prisma.$transaction([
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
    prisma.order.findMany({
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED"] } },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        paidAt: true,
        shippedAt: true,
        updatedAt: true,
        createdAt: true,
        user: { select: { name: true } },
      },
      orderBy: { updatedAt: "asc" },
      take: 50,
    }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.adminNotification.count({ where: { isRead: false } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.webhookLog.findMany({
      where: { createdAt: { gte: incidentWindowStart } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        provider: true,
        eventType: true,
        status: true,
        errorMessage: true,
        createdAt: true,
        orderId: true,
      },
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
  ];

  const recentOrders: DashboardRecentOrderDTO[] = rawOrders.map((order) => ({
    ...order,
    total: Number(order.total),
  }));

  const slaQueue = sortSlaQueue(
    slaCandidates
      .map((order) => buildSlaQueueItem(order, now))
      .filter((item): item is NonNullable<typeof item> => item !== null)
  ).slice(0, SLA_QUEUE_LIMIT);

  const ordersNeedingAttention = pendingOrders + paidAwaitingFulfillment + processingOrders;
  const paymentIncidents = buildPaymentIncidentsFromLogs(webhookLogs);

  return {
    stats,
    recentOrders,
    slaQueue,
    paymentIncidents,
    backlog: {
      pendingReviews,
      unreadNotifications,
      ordersNeedingAttention,
      pendingOrders,
      paidAwaitingFulfillment,
      processingOrders,
    },
    serverNow: now.toISOString(),
  };
}
