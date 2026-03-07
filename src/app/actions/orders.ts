"use server";

import { prisma } from "@/lib/prisma";
import type { Order } from "@/app/admin/pedidos/types";

const STATUS_MAP: Record<string, string> = {
  PENDING:    "Pendiente",
  PROCESSING: "Procesando",
  PAID:       "Pagado",
  SHIPPED:    "Enviado",
  DELIVERED:  "Entregado",
  CANCELLED:  "Cancelado",
  FAILED:     "Fallido",
};

const METHOD_MAP: Record<string, string> = {
  BOLD:        "Bold",
  ADDI:        "Addi",
  NEQUI:       "Nequi",
  BANCOLOMBIA: "Bancolombia",
  DAVIPLATA:   "Daviplata",
};

const STATUS_ES_TO_DB: Record<string, string> = {
  Pendiente:  "PENDING",
  Procesando: "PROCESSING",
  Pagado:     "PAID",
  Enviado:    "SHIPPED",
  Cancelado:  "CANCELLED",
  Fallido:    "FAILED",
};

export async function updateOrderStatus(orderNumber: string, statusEs: string): Promise<void> {
  const dbStatus = STATUS_ES_TO_DB[statusEs];
  if (!dbStatus) throw new Error(`Estado inválido: ${statusEs}`);
  await prisma.order.update({
    where: { orderNumber },
    data:  { status: dbStatus as any },
  });
}

export async function getOrders(): Promise<Order[]> {
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
    items: o.items.map((item) => ({
      name:  item.name,
      qty:   item.quantity,
      price: Number(item.price),
    })),
  }));
}
