import type { Prisma } from "@prisma/client";

// Pedidos pagados. La web solo guarda PAID; PROCESSING, SHIPPED y DELIVERED quedan en pedidos viejos (la
// logística vive en el POS).
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
