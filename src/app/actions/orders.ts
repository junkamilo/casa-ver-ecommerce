"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Order } from "@/app/admin/pedidos/types";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

const STATUS_MAP: Record<string, string> = {
  PENDING:    "Pendiente",
  PROCESSING: "Procesando",
  PAID:       "Pagado",
  SHIPPED:    "Enviado",
  DELIVERED:  "Entregado",
  CANCELLED:  "Cancelado",
  FAILED:     "Fallido",
  REFUNDED:   "Reembolsado",
};

const METHOD_MAP: Record<string, string> = {
  BOLD:        "Bold",
  ADDI:        "Addi",
  NEQUI:       "Nequi",
  BANCOLOMBIA: "Bancolombia",
  DAVIPLATA:   "Daviplata",
};

const STATUS_ES_TO_DB: Record<string, string> = {
  Pendiente:    "PENDING",
  Procesando:   "PROCESSING",
  Pagado:       "PAID",
  Enviado:      "SHIPPED",
  Entregado:    "DELIVERED",
  Cancelado:    "CANCELLED",
  Fallido:      "FAILED",
  Reembolsado:  "REFUNDED",
};

/**
 * Transiciones permitidas a nivel de base de datos.
 * Sólo el admin puede avanzar entre estos estados.
 * PENDING, PAID y FAILED los gestiona exclusivamente el sistema de pagos (webhooks).
 */
const VALID_TRANSITIONS_DB: Record<string, string[]> = {
  PAID:       ["PROCESSING", "CANCELLED", "REFUNDED"],
  PROCESSING: ["SHIPPED",    "CANCELLED", "REFUNDED"],
  SHIPPED:    ["DELIVERED",  "REFUNDED"],
  DELIVERED:  ["REFUNDED"],
};

export async function updateOrderStatus(orderNumber: string, statusEs: string): Promise<void> {
  await requireAdmin();

  const dbStatus = STATUS_ES_TO_DB[statusEs];
  if (!dbStatus) throw new Error(`Estado inválido: ${statusEs}`);

  // Leer estado actual para validar la transición
  const current = await prisma.order.findUnique({
    where:  { orderNumber },
    select: { status: true },
  });
  if (!current) throw new Error(`Pedido no encontrado: ${orderNumber}`);

  const allowed = VALID_TRANSITIONS_DB[current.status] ?? [];
  if (!allowed.includes(dbStatus)) {
    throw new Error(
      `Transición no permitida: el pedido está en "${STATUS_MAP[current.status]}" y no puede pasar a "${statusEs}".`
    );
  }

  const now = new Date();
  const extraData: Record<string, Date> = {};
  if (dbStatus === "SHIPPED")    extraData.shippedAt   = now;
  if (dbStatus === "DELIVERED")  extraData.deliveredAt = now;
  if (dbStatus === "CANCELLED")  extraData.cancelledAt = now;
  if (dbStatus === "REFUNDED")   extraData.cancelledAt = now;

  await prisma.order.update({
    where: { orderNumber },
    data:  { status: dbStatus as any, ...extraData },
  });
}

export async function getOrders(): Promise<Order[]> {
  await requireAdmin();
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { email: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((o) => ({
    id:            o.orderNumber,
    customer:      o.shippingName,
    email:         o.user.email ?? "",
    phone:         o.shippingPhone,
    total:         Number(o.total),
    subtotal:      Number(o.subtotal),
    shippingCost:  Number(o.shippingCost),
    discount:      Number(o.discount),
    status:        STATUS_MAP[o.status] ?? o.status,
    paymentMethod: METHOD_MAP[o.paymentMethod] ?? o.paymentMethod,
    date:          o.createdAt.toLocaleString("es-CO", { timeZone: "America/Bogota" }),
    address:       `${o.shippingAddress}, ${o.shippingCity}, ${o.shippingDepartment}`,
    deliveredAt:   o.deliveredAt
      ? o.deliveredAt.toLocaleString("es-CO", { timeZone: "America/Bogota" })
      : undefined,
    items: o.items.map((item) => ({
      name:  item.name,
      qty:   item.quantity,
      price: Number(item.price),
    })),
  }));
}
