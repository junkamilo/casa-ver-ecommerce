import type { Prisma } from "@prisma/client";

export const REVENUE_ORDER_STATUSES = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

export function buildRevenueOrderWhere(start: Date, end: Date): Prisma.OrderWhereInput {
  return {
    status: { in: [...REVENUE_ORDER_STATUSES] },
    createdAt: { gte: start, lte: end },
  };
}

export function buildRevenueOrderItemWhere(
  start: Date,
  end: Date
): Prisma.OrderItemWhereInput {
  return {
    order: buildRevenueOrderWhere(start, end),
  };
}

export function buildDeliveredOrderWhere(start: Date, end: Date): Prisma.OrderWhereInput {
  return {
    status: "DELIVERED",
    createdAt: { gte: start, lte: end },
  };
}
