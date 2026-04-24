import { cancelAddiApplication } from "@/services/addi/cancel";
import type { AdminOrderDTO } from "../contracts/order-admin.dto";
import { PrismaOrderAdminRepository } from "../infrastructure/prisma-order-admin.repository";
import { OrderAdminNotFoundError, OrderAdminValidationError } from "./order-admin.errors";

const repository = new PrismaOrderAdminRepository();

const STATUS_MAP: Record<string, string> = {
  PENDING: "Pendiente",
  PROCESSING: "Procesando",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  FAILED: "Fallido",
  REFUNDED: "Reembolsado",
};

const METHOD_MAP: Record<string, string> = {
  BOLD: "Bold",
  ADDI: "Addi",
  NEQUI: "Nequi",
  BANCOLOMBIA: "Bancolombia",
  DAVIPLATA: "Daviplata",
};

const STATUS_ES_TO_DB: Record<string, string> = {
  Pendiente: "PENDING",
  Procesando: "PROCESSING",
  Pagado: "PAID",
  Enviado: "SHIPPED",
  Entregado: "DELIVERED",
  Cancelado: "CANCELLED",
  Fallido: "FAILED",
  Reembolsado: "REFUNDED",
};

const VALID_TRANSITIONS_DB: Record<string, string[]> = {
  PAID: ["PROCESSING", "CANCELLED", "REFUNDED"],
  PROCESSING: ["SHIPPED", "CANCELLED", "REFUNDED"],
  SHIPPED: ["DELIVERED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
};

export async function getAdminOrdersUseCase(): Promise<AdminOrderDTO[]> {
  const cedulaRows = await repository.getCedulaRows();
  const cedulaMap = new Map(
    cedulaRows.map((row) => [row.orderNumber, row.shippingCedula ?? row.userCedula])
  );
  const orders = await repository.listOrdersForAdmin();
  return orders.map((order) => ({
    id: order.orderNumber,
    customer: order.shippingName,
    email: order.user.email ?? "",
    phone: order.shippingPhone,
    cedula: cedulaMap.get(order.orderNumber) ?? undefined,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discount: Number(order.discount),
    status: STATUS_MAP[order.status] ?? order.status,
    paymentMethod: METHOD_MAP[order.paymentMethod] ?? order.paymentMethod,
    date: order.createdAt.toLocaleString("es-CO", { timeZone: "America/Bogota" }),
    address: `${order.shippingAddress}, ${order.shippingCity}, ${order.shippingDepartment}`,
    deliveredAt: order.deliveredAt
      ? order.deliveredAt.toLocaleString("es-CO", { timeZone: "America/Bogota" })
      : undefined,
    items: order.items.map((item) => ({
      name: item.name,
      qty: item.quantity,
      price: Number(item.price),
    })),
  }));
}

export async function updateAdminOrderStatusUseCase(orderNumber: string, statusEs: string): Promise<void> {
  const dbStatus = STATUS_ES_TO_DB[statusEs];
  if (!dbStatus) throw new OrderAdminValidationError(`Estado inválido: ${statusEs}`);

  const current = await repository.findOrderStatusByNumber(orderNumber);
  if (!current) throw new OrderAdminNotFoundError(`Pedido no encontrado: ${orderNumber}`);

  const allowed = VALID_TRANSITIONS_DB[current.status] ?? [];
  if (!allowed.includes(dbStatus)) {
    throw new OrderAdminValidationError(
      `Transición no permitida: el pedido está en "${STATUS_MAP[current.status]}" y no puede pasar a "${statusEs}".`
    );
  }

  const isCancellation = dbStatus === "CANCELLED" || dbStatus === "REFUNDED";
  if (isCancellation && current.paymentMethod === "ADDI" && current.transactionId) {
    const cancelResult = await cancelAddiApplication(current.transactionId, Number(current.total));
    if (!cancelResult.success) {
      console.error(
        `[updateAdminOrderStatusUseCase] Fallo al cancelar crédito Addi para orden ${orderNumber}:`,
        cancelResult.error
      );
    }
  }

  const now = new Date();
  const extraData: { shippedAt?: Date; deliveredAt?: Date; cancelledAt?: Date } = {};
  if (dbStatus === "SHIPPED") extraData.shippedAt = now;
  if (dbStatus === "DELIVERED") extraData.deliveredAt = now;
  if (dbStatus === "CANCELLED" || dbStatus === "REFUNDED") extraData.cancelledAt = now;
  await repository.updateOrderStatus(orderNumber, dbStatus, extraData);
}
